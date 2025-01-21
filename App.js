import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
  Modal,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

const Stack = createNativeStackNavigator();

function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    const users = JSON.parse((await AsyncStorage.getItem('users')) || '{}');
    if (!email || !password) {
      return Alert.alert('Error', 'Harap isi semua kolom!');
    }
    if (!users[email] || users[email].password !== password) {
      return Alert.alert('Error', 'Email atau password salah!');
    }
    Alert.alert('Selamat datang', `Halo, ${users[email].name}!`);
    navigation.navigate('Dashboard');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('Register')}>
        <Text style={styles.toggleAuth}>Belum punya akun? Daftar</Text>
      </TouchableOpacity>
    </View>
  );
}

function RegisterScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = async () => {
    const users = JSON.parse((await AsyncStorage.getItem('users')) || '{}');
    if (!name || !email || !password) {
      return Alert.alert('Error', 'Harap isi semua kolom!');
    }
    if (users[email]) {
      return Alert.alert('Error', 'Pengguna sudah terdaftar!');
    }
    users[email] = { name, password };
    await AsyncStorage.setItem('users', JSON.stringify(users));
    Alert.alert('Berhasil', 'Akun berhasil didaftarkan!');
    navigation.navigate('Login');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Daftar</Text>
      <TextInput
        placeholder="Nama"
        value={name}
        onChangeText={setName}
        style={styles.input}
      />
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />
      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>Daftar</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text style={styles.toggleAuth}>Sudah punya akun? Login</Text>
      </TouchableOpacity>
    </View>
  );
}

function DashboardScreen({ navigation }) {
  const [items, setItems] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    const fetchItems = async () => {
      const storedItems = JSON.parse((await AsyncStorage.getItem('items')) || '[]');
      setItems(storedItems);
    };
    fetchItems();
  }, []);

  const handleDelete = async (id) => {
    const filteredItems = items.filter((item) => item.id !== id);
    setItems(filteredItems);
    await AsyncStorage.setItem('items', JSON.stringify(filteredItems));
  };

  const handleUpdate = async () => {
    if (!selectedItem.name) {
      return Alert.alert('Error', 'Nama item tidak boleh kosong!');
    }
    const updatedItems = items.map((item) =>
      item.id === selectedItem.id ? selectedItem : item
    );
    setItems(updatedItems);
    await AsyncStorage.setItem('items', JSON.stringify(updatedItems));
    setModalVisible(false);
    Alert.alert('Berhasil', 'Item berhasil diperbarui!');
  };

  const calculateTotal = () => {
    return items.reduce((total, item) => total + item.price, 0);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>daftar barang belanja</Text>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <View>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemPrice}>Rp {item.price}</Text>
            </View>
            <View style={styles.actions}>
              <TouchableOpacity style={styles.button} onPress={() => {
                setSelectedItem(item);
                setModalVisible(true);
              }}>
                <Text style={styles.buttonText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.button} onPress={() => handleDelete(item.id)}>
                <Text style={styles.buttonText}>Hapus</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
      <Text style={styles.total}>Total: Rp {calculateTotal()}</Text>
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('CRUD')}>
        <Text style={styles.buttonText}>Tambah Item</Text>
      </TouchableOpacity>
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TextInput
              placeholder="Nama Item"
              value={selectedItem?.name || ''}
              onChangeText={(text) =>
                setSelectedItem((prev) => ({ ...prev, name: text }))
              }
              style={styles.input}
            />
            <TextInput
              placeholder="Harga Item"
              value={selectedItem?.price?.toString() || ''}
              onChangeText={(text) =>
                setSelectedItem((prev) => ({ ...prev, price: parseFloat(text) || 0 }))
              }
              style={styles.input}
              keyboardType="numeric"
            />
            <TouchableOpacity style={styles.button} onPress={handleUpdate}>
              <Text style={styles.buttonText}>Perbarui Item</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={() => setModalVisible(false)}>
              <Text style={styles.buttonText}>Batal</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function CRUDScreen({ navigation }) {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');

  const handleAdd = async () => {
    if (!name || !price) {
      return Alert.alert('Error', 'Semua kolom wajib diisi!');
    }
    const items = JSON.parse((await AsyncStorage.getItem('items')) || '[]');
    const newItem = { id: Date.now(), name, price: parseFloat(price) };
    const updatedItems = [...items, newItem];
    await AsyncStorage.setItem('items', JSON.stringify(updatedItems));
    Alert.alert('Berhasil', 'Item berhasil ditambahkan!');
    navigation.navigate('Dashboard');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tambah Item Baru</Text>
      <TextInput
        placeholder="Nama Item"
        value={name}
        onChangeText={setName}
        style={styles.input}
      />
      <TextInput
        placeholder="Harga Item"
        value={price}
        onChangeText={setPrice}
        style={styles.input}
        keyboardType="numeric"
      />
      <TouchableOpacity style={styles.button} onPress={handleAdd}>
        <Text style={styles.buttonText}>Tambah Item</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="Dashboard" component={DashboardScreen} />
        <Stack.Screen name="CRUD" component={CRUDScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f4f4f9', // Warna latar belakang yang lebih lembut
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#4A90E2', // Warna biru cerah untuk teks judul
  },
  input: {
    borderWidth: 1,
    padding: 10,
    marginVertical: 10,
    borderRadius: 5,
    borderColor: '#ccc',
    backgroundColor: '#fff',
  },
  toggleAuth: {
    marginTop: 10,
    textAlign: 'center',
    color: '#4CAF50', // Warna hijau untuk teks link
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  itemName: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#333',
  },
  itemPrice: {
    color: '#4CAF50', // Warna hijau untuk harga
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
  },
  button: {
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 5,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 },
    elevation: 5,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
  },
  total: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    textAlign: 'center',
    color: '#4CAF50', // Warna hijau untuk total
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    margin: 20,
  },
});
