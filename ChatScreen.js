import React, {useEffect, useState, useRef} from 'react';
import { View, TextInput, Button, FlatList, Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { io } from 'socket.io-client';

const API = process.env.SERVER_URL || 'http://10.0.2.2:4000';

export default function ChatScreen({ route, navigation }){
  const { user } = route.params;
  const [messages,setMessages]=useState([]);
  const [text,setText]=useState('');
  const socketRef = useRef(null);
  const [conversationId, setConversationId] = useState(null);

  useEffect(()=>{
    (async()=>{
      const token = await AsyncStorage.getItem('token');
      // create/fetch conversation
      const convRes = await axios.post(`${API}/conversations`, { otherUserId: user._id }, { headers: { Authorization: `Bearer ${token}` } });
      setConversationId(convRes.data._id);
      socketRef.current = io(API, { auth: { token } });
      socketRef.current.on('connect', ()=>console.log('socket connected'));
      socketRef.current.on('message:new', (msg)=> setMessages(m=>[msg,...m]));
      // load recent messages
      const msgs = await axios.get(`${API}/conversations/${convRes.data._id}/messages`, { headers: { Authorization: `Bearer ${token}` } });
      setMessages(msgs.data);
    })();
    return ()=> socketRef.current?.disconnect();
  },[]);

  const send = async () => {
    if (!conversationId) return;
    socketRef.current.emit('message:send', { conversationId, text });
    setText('');
  };

  return (
    <View style={{flex:1}}>
      <FlatList data={messages} inverted keyExtractor={m=>m._id} renderItem={({item})=>(
        <Text style={{padding:8}}>{item.text}</Text>
      )} />
      <View style={{flexDirection:'row'}}>
        <TextInput value={text} onChangeText={setText} style={{flex:1}} />
        <Button title="Send" onPress={send} />
      </View>
    </View>
  );
}