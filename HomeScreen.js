import React, {useEffect, useState} from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API = process.env.SERVER_URL || 'http://10.0.2.2:4000';

export default function HomeScreen({ navigation }){
  const [users, setUsers] = useState([]);
  useEffect(()=>{ (async()=>{
    const token = await AsyncStorage.getItem('token');
    const res = await axios.get(`${API}/users`, { headers: { Authorization: `Bearer ${token}` } });
    setUsers(res.data);
  })(); },[]);

  return (
    <View>
      <FlatList data={users} keyExtractor={u=>u._id} renderItem={({item})=> (
        <TouchableOpacity onPress={()=>navigation.navigate('Chat',{ user: item })}>
          <Text style={{padding:16}}>{item.name}\n{item.email}</Text>
        </TouchableOpacity>
      )} />
    </View>
  );
}