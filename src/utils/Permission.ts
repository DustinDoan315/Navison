// import {PermissionsAndroid, Platform} from 'react-native';
// import {PERMISSIONS, requestMultiple} from 'react-native-permissions';
// import DeviceInfo from 'react-native-device-info';

// type VoidCallback = (result: boolean) => void;

// export const requestPermissions = async (cb: VoidCallback) => {
//   if (Platform.OS === 'android') {
//     const apiLevel = await DeviceInfo.getApiLevel();

//     if (apiLevel < 31) {
//       const granted = await PermissionsAndroid.request(
//         PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
//         {
//           title: 'Location Permission',
//           message: 'Bluetooth Low Energy requires Location',
//           buttonNeutral: 'Ask Later',
//           buttonNegative: 'Cancel',
//           buttonPositive: 'OK',
//         },
//       );
//       cb(granted === PermissionsAndroid.RESULTS.GRANTED);
//     } else {
//       const result = await requestMultiple([
//         PERMISSIONS.ANDROID.BLUETOOTH_SCAN,
//         PERMISSIONS.ANDROID.BLUETOOTH_CONNECT,
//         PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
//       ]);

//       const isGranted =
//         result['android.permission.BLUETOOTH_CONNECT'] ===
//           PermissionsAndroid.RESULTS.GRANTED &&
//         result['android.permission.BLUETOOTH_SCAN'] ===
//           PermissionsAndroid.RESULTS.GRANTED &&
//         result['android.permission.ACCESS_FINE_LOCATION'] ===
//           PermissionsAndroid.RESULTS.GRANTED;

//       cb(isGranted);
//     }
//   } else {
//     cb(true);
//   }
// };
