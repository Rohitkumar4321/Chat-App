import React, {useState} from 'react';
import { View, TextInput, Button } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API = process.env.SERVER_URL || 'http://10.0.2.2:4000';

export default function LoginScreen({ navigation }){
  const [email,setEmail]=useState('alice@example.com');
  const [password,setPassword]=useState('123456');
  const submit = async () => {
    const res = await axios.post(`${API}/auth/login`, { email, password });
    await AsyncStorage.setItem('token', res.data.token);
    navigation.replace('Home');
  };
  return (
    <View style={{padding:20}}>
      <TextInput value={email} onChangeText={setEmail} placeholder="email" />
      <TextInput value={password} onChangeText={setPassword} placeholder="password" secureTextEntry />
      <Button title="Login" onPress={submit} />
    </View>
  );
}