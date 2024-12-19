/* eslint-disable react-hooks/exhaustive-deps */
import {PermissionsAndroid, Platform} from 'react-native';
import {PERMISSIONS, requestMultiple} from 'react-native-permissions';
import DeviceInfo from 'react-native-device-info';
import {useState, useCallback} from 'react';
import {
  BleError,
  BleManager,
  Characteristic,
  Device,
} from 'react-native-ble-plx';

const APP_NAVISON_UUID = '0000180d-0000-1000-8000-00805f9b34fb';
const APP_NAVISON_CHARACTERISTIC = '00002a37-0000-1000-8000-00805f9b34fb';

const bleManager = new BleManager();

type VoidCallback = (result: boolean) => void;

interface BluetoothLowEnergyApi {
  requestPermissions(cb: VoidCallback): Promise<void>;
  scanForPeripherals(setIsLoading: any): void;
  connectToDevice: (deviceId: Device) => Promise<void>;
  disconnectFromDevice: () => void;
  connectedDevice: Device | null;
  allDevices: Device[];
  heartRate: number;
  sendCommandToDevice: (deviceId: string, command: string) => void;
}

const useBLE = (): BluetoothLowEnergyApi => {
  const [allDevices, setAllDevices] = useState<Device[]>([]);
  const [connectedDevice, setConnectedDevice] = useState<Device | null>(null);
  const [heartRate, setHeartRate] = useState<number>(0);

  const requestPermissions = useCallback(async (cb: VoidCallback) => {
    if (Platform.OS === 'android') {
      const apiLevel = await DeviceInfo.getApiLevel();

      if (apiLevel < 31) {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message: 'Bluetooth Low Energy requires Location',
            buttonNeutral: 'Ask Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        cb(granted === PermissionsAndroid.RESULTS.GRANTED);
      } else {
        const result = await requestMultiple([
          PERMISSIONS.ANDROID.BLUETOOTH_SCAN,
          PERMISSIONS.ANDROID.BLUETOOTH_CONNECT,
          PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
        ]);

        const isGranted =
          result['android.permission.BLUETOOTH_CONNECT'] ===
            PermissionsAndroid.RESULTS.GRANTED &&
          result['android.permission.BLUETOOTH_SCAN'] ===
            PermissionsAndroid.RESULTS.GRANTED &&
          result['android.permission.ACCESS_FINE_LOCATION'] ===
            PermissionsAndroid.RESULTS.GRANTED;

        cb(isGranted);
      }
    } else {
      cb(true);
    }
  }, []);

  const isDuplicateDevice = (devices: Device[], nextDevice: Device) =>
    devices.some(device => nextDevice.id === device.id);

  const scanForPeripherals = useCallback(
    (setIsLoading: any) =>
      bleManager.startDeviceScan(null, null, (error, device) => {
        if (error) {
          console.log(error);
          bleManager.stopDeviceScan();
          setIsLoading(false);
          return;
        }
        if (device) {
          setAllDevices(prevState => {
            const updatedDevices = !isDuplicateDevice(prevState, device)
              ? [...prevState, device]
              : prevState;
            bleManager.stopDeviceScan();
            setIsLoading(false);
            return updatedDevices;
          });
        }
      }),
    [],
  );

  const connectToDevice = useCallback(async (device: Device) => {
    try {
      const deviceConnection = await bleManager.connectToDevice(device.id);
      setConnectedDevice(deviceConnection);
      await deviceConnection.discoverAllServicesAndCharacteristics();
      bleManager.stopDeviceScan();
      startStreamingData(deviceConnection);
    } catch (e) {
      console.log('FAILED TO CONNECT', e);
    }
  }, []);

  const disconnectFromDevice = useCallback(() => {
    if (connectedDevice) {
      bleManager.cancelDeviceConnection(connectedDevice.id);
      setConnectedDevice(null);
      setHeartRate(0);
    }
  }, [connectedDevice]);

  const startStreamingData = useCallback(async (device: Device) => {
    if (device) {
      device.monitorCharacteristicForService(
        APP_NAVISON_UUID,
        APP_NAVISON_CHARACTERISTIC,
        (error, characteristic) => onHeartRateUpdate(error, characteristic),
      );
    } else {
      console.log('No Device Connected');
    }
  }, []);

  const onHeartRateUpdate = useCallback(
    (error: BleError | null, characteristic: Characteristic | null) => {
      console.log(characteristic);
    },
    [],
  );

  const sendCommandToDevice = useCallback(
    async (deviceId: string, command: string) => {
      if (!connectedDevice || connectedDevice.id !== deviceId) {
        console.warn('Device not connected');
        return;
      }
      try {
        const commandBytes = Buffer.from(command, 'utf-8');

        await bleManager.writeCharacteristicWithResponseForDevice(
          deviceId,
          APP_NAVISON_UUID,
          APP_NAVISON_CHARACTERISTIC,
          commandBytes.toString('base64'),
        );

        console.log(`Command sent to ${deviceId}: ${command}`);
      } catch (error) {
        console.error('Error sending command', error);
      }
    },
    [connectedDevice],
  );

  return {
    scanForPeripherals,
    requestPermissions,
    connectToDevice,
    allDevices,
    connectedDevice,
    disconnectFromDevice,
    heartRate,
    sendCommandToDevice,
  };
};

export default useBLE;
