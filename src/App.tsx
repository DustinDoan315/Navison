import React, {useEffect, useState} from 'react';
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
} from 'react-native';
import {handleLocationPermission} from './utils/Permission';

interface BluetoothDevice {
  id: string;
  name?: string;
}

interface PortConfiguration {
  id: number;
  timer: number;
  index: number;
}

const App: React.FC = () => {
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

  const [selectedPort, setSelectedPort] = useState<PortConfiguration | null>(
    null,
  );
  const [timerValue, setTimerValue] = useState<string>('');
  const [isModalVisible, setModalVisible] = useState<boolean>(false);

  useEffect(() => {
    handleLocationPermission();
  }, []);

  const handleConnect = async (device: BluetoothDevice) => {
    console.log('---device: ', device);
  };

  const handleSendConfig = async () => {
    const configData = portConfigurations.map(port => ({
      port: port.index,
      timer: port.timer,
    }));
    console.log('---configData: ', configData);
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

  return (
    <SafeAreaView style={{flex: 1}}>
      <ScrollView style={styles.container}>
        <Button title="Scan for Devices" />
        <FlatList
          scrollEnabled={false}
          data={[]}
          keyExtractor={(item: any) => item.id}
          renderItem={({item}) => (
            <TouchableOpacity
              style={styles.deviceItem}
              onPress={() => handleConnect(item)}>
              <Text style={styles.deviceText}>
                {item.name || 'Unnamed Device'}
              </Text>
            </TouchableOpacity>
          )}
          ListHeaderComponent={<Text style={styles.headerText}>Devices</Text>}
        />

        <Text style={styles.headerText}>Port Configurations</Text>
        {portConfigurations.map(port => (
          <TouchableOpacity
            key={port.id}
            style={styles.portItem}
            onPress={() => openModal(port)}>
            <Text style={styles.portText}>Port {port.index}</Text>
            <Text style={styles.portTimer}>Timer: {port.timer} s</Text>
          </TouchableOpacity>
        ))}

        <Button title="Send Configuration" onPress={handleSendConfig} />

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
