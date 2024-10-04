import {Platform} from 'react-native';
import {PERMISSIONS, RESULTS, request} from 'react-native-permissions';

export const handleLocationPermission = async () => {
  let isPermitted = false;
  if (Platform.OS === 'ios') {
    const locationResult = await Promise.all([
      request(PERMISSIONS.IOS.LOCATION_ALWAYS),
      request(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE),
    ]);
    let resultAlways = locationResult[0];
    let resultWhenInUse = locationResult.length > 1 ? locationResult[1] : null;
    const isResultAlwaysDenied = () => {
      if (
        resultAlways === RESULTS.BLOCKED ||
        resultAlways === RESULTS.UNAVAILABLE ||
        resultAlways === RESULTS.DENIED
      ) {
        return true;
      } else {
        return false;
      }
    };
    const isResultWhenInUseDenied = () => {
      if (
        resultWhenInUse === RESULTS.BLOCKED ||
        resultWhenInUse === RESULTS.UNAVAILABLE ||
        resultWhenInUse === RESULTS.DENIED
      ) {
        return true;
      } else {
        return false;
      }
    };
    if (isResultAlwaysDenied() && isResultWhenInUseDenied()) {
      //user hasn't allowed location
      isPermitted = false;
    } else {
      //user has allowed location
      isPermitted = true;
    }
  } else {
    //ask for location permissions for Android
    const result = await request(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION);
    isPermitted = result === RESULTS.GRANTED;
  }

  if (isPermitted) {
    //Location permitted successfully, display next permission
  }
};
