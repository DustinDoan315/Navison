/* eslint-disable react-native/no-inline-styles */
import React, {useState} from 'react';
import {
  View,
  Text,
  Button,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import useBLE from './components/useBLE';

interface BluetoothDevice {
  id: string;
  name: string | null;
}

interface PortConfiguration {
  id: number;
  timer: number;
  index: number;
}

const App: React.FC = () => {
  const {
    requestPermissions,
    scanForPeripherals,
    allDevices,
    connectToDevice,
    sendCommandToDevice,
  } = useBLE();

  const [portConfigurations, setPortConfigurations] = useState<
    PortConfiguration[]
  >([
    {id: 1, timer: 0, index: 1},
    {id: 2, timer: 0, index: 2},
    {id: 3, timer: 0, index: 3},
    {id: 4, timer: 0, index: 4},
    {id: 5, timer: 0, index: 5},
    {id: 6, timer: 0, index: 6},
    {id: 7, timer: 0, index: 7},
    {id: 8, timer: 0, index: 8},
  ]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const uniqueIds = new Set();
  const mappingData: BluetoothDevice[] = allDevices
    .filter(
      device =>
        device.name && !uniqueIds.has(device.id) && uniqueIds.add(device.id),
    )
    .map(device => ({
      id: device.id,
      name: device.name,
    }));

  console.log('---allDevices: ', mappingData.slice(0, 10));

  const [selectedPort, setSelectedPort] = useState<PortConfiguration | null>(
    null,
  );
  const [timerValue, setTimerValue] = useState<string>('');
  const [isModalVisible, setModalVisible] = useState<boolean>(false);
  const [selectedDevice, setSelectedDevice] = useState<BluetoothDevice | null>(
    null,
  );

  const handleSendConfig = async () => {
    const configData = portConfigurations.map(
      port => `${port.index},${port.timer}`,
    );
    if (selectedDevice) {
      sendCommandToDevice(selectedDevice.id, configData.toString());
      console.log('---configData: ', JSON.stringify(configData.toString()));
    }
  };

  const toggleLed = () => {
    if (selectedDevice) {
      sendCommandToDevice(selectedDevice.id, 'TOGGLE_LED');
      console.log(`Toggling LED on device ${selectedDevice.id}`);
    }
  };

  const openModal = (port: PortConfiguration) => {
    setSelectedPort(port);
    setTimerValue(port.timer.toString());
    setModalVisible(true);
  };

  const applyTimer = () => {
    if (selectedPort) {
      const updatedConfigurations = portConfigurations.map(port =>
        port.id === selectedPort.id
          ? {...port, timer: parseInt(timerValue) || 0}
          : port,
      );
      setPortConfigurations(updatedConfigurations);
    }
    setModalVisible(false);
  };

  const movePort = (index: number, direction: 'up' | 'down') => {
    const newConfigurations = [...portConfigurations];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;

    if (targetIndex >= 0 && targetIndex < newConfigurations.length) {
      [newConfigurations[index], newConfigurations[targetIndex]] = [
        newConfigurations[targetIndex],
        newConfigurations[index],
      ];
      setPortConfigurations(newConfigurations);
    }
  };

  const scanForDevices = () => {
    requestPermissions(isGranted => {
      if (isGranted) {
        setIsLoading(true);
        setTimeout(() => scanForPeripherals(setIsLoading), 700);
      }
    });
  };

  return (
    <SafeAreaView style={{flex: 1}}>
      <ScrollView style={styles.container}>
        <TouchableOpacity
          style={[
            styles.button,
            {backgroundColor: isLoading ? '#6c757d' : '#007BFF'},
          ]}
          onPress={scanForDevices}
          disabled={isLoading}>
          {isLoading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.buttonText}>Scan for Devices</Text>
          )}
        </TouchableOpacity>
        <FlatList
          scrollEnabled={false}
          data={mappingData.slice(0, 10)}
          keyExtractor={(item: any) => item.id}
          renderItem={({item}: any) => (
            <TouchableOpacity
              style={styles.deviceItem}
              onPress={() => {
                connectToDevice(item);
                setSelectedDevice(item);
              }}>
              <Text style={styles.deviceText}>
                {item.name || 'Unnamed Device'}
              </Text>
            </TouchableOpacity>
          )}
          ListHeaderComponent={<Text style={styles.headerText}>Devices</Text>}
        />

        <Text style={styles.headerText}>Port Configurations</Text>
        {portConfigurations.map((port, index) => (
          <View key={port.id} style={styles.portItem}>
            <TouchableOpacity onPress={() => openModal(port)}>
              <Text style={styles.portText}>Port {port.index}</Text>
              <Text style={styles.portTimer}>Timer: {port.timer} s</Text>
            </TouchableOpacity>

            {/* Up and Down Buttons for Reordering */}
            <View style={styles.orderButtons}>
              <TouchableOpacity
                style={styles.button}
                onPress={() => movePort(index, 'up')}
                disabled={index === 0}>
                <Text style={styles.buttonText}>Up</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, {backgroundColor: 'orange'}]}
                onPress={() => movePort(index, 'down')}
                disabled={index === portConfigurations.length - 1}>
                <Text style={styles.buttonText}>Down</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, {backgroundColor: '#007BFF'}]}
            onPress={() => handleSendConfig()}>
            <Text style={styles.buttonText}>Send Configuration</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, {backgroundColor: 'green'}]}
            onPress={toggleLed}>
            <Text style={styles.buttonText}>Toggle LED</Text>
          </TouchableOpacity>
        </View>

        <Modal
          visible={isModalVisible}
          transparent={true}
          animationType="slide">
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>
                Set Timer for Port {selectedPort?.index}
              </Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={timerValue}
                onChangeText={text => setTimerValue(text)}
              />
              <View
                style={{
                  flexDirection: 'row',
                  width: '100%',
                  justifyContent: 'space-between',
                }}>
                <Button title="Apply" onPress={applyTimer} />
                <Button
                  title="Cancel"
                  color="red"
                  onPress={() => setModalVisible(false)}
                />
              </View>
            </View>
          </View>
        </Modal>

        <View
          style={{
            height: 200,
          }}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f0f0f0',
  },
  deviceItem: {
    padding: 15,
    marginVertical: 8,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    elevation: 3,
  },
  deviceText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333333',
  },
  headerText: {
    fontSize: 18,
    fontWeight: '600',
    marginVertical: 10,
  },
  portItem: {
    padding: 15,
    marginVertical: 8,
    backgroundColor: '#e3e3e3',
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  portText: {
    fontSize: 16,
    fontWeight: '500',
  },
  portTimer: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666666',
  },
  orderButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10, // Add spacing above the buttons
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  button: {
    backgroundColor: '#007BFF', // Button background color
    padding: 10,
    borderRadius: 5,
    marginHorizontal: 5, // Spacing between buttons
  },
  buttonText: {
    color: '#FFFFFF', // Button text color
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: 300,
    padding: 20,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    elevation: 5,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    padding: 10,
    borderColor: '#cccccc',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 20,
  },
});

export default App;
