import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import React, { useContext, useEffect, useState } from 'react';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { UserType } from '../UserContext';
import { URL } from '../Url';

const UserChat = ({ item }) => {
  const { userId, setUserId } = useContext(UserType);
  const navigation = useNavigation();
  const [messages, setMessages] = useState([]);
  const fetchMessages = async () => {
    try {
      const response = await fetch(`${URL}/message/${userId}/${item._id}`);
      const data = await response.json();
      if (response.ok) {
        setMessages(data);
      } else {
        console.log('error showing messages', response.status.message);
      }
    } catch (error) {
      console.log('error fetching messages', error);
    }
  };
  const isFocused = useIsFocused();

  useEffect(() => {
    fetchMessages();
  }, [isFocused]);

  const getLastMessage = () => {
    const userMessages = messages.filter(
      (message) => message.messageType === 'text'
    );
    const n = userMessages.length;
    return userMessages[n - 1];
  };
  const lastMessage = getLastMessage();

  const formatTime = (time) => {
    const options = { hour: 'numeric', minute: 'numeric' };
    return new Date(time).toLocaleString('en-Us', options);
  };

  return (
    <Pressable
      onPress={() =>
        navigation.navigate('Messages', {
          recepientId: item._id
        })
      }
      style={{
        flexDirection: 'row',
        alignContent: 'center',
        gap: 10,
        borderWidth: 0.7,
        borderColor: '#d0d0d0',
        borderTopWidth: 0,
        borderLeftWidth: 0,
        borderRightWidth: 0,
        padding: 10
      }}
    >
      <Image
        style={{ width: 50, height: 50, borderRadius: 25, resizeMode: 'cover' }}
        source={{ uri: item?.image }}
      />
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 15, fontWeight: 500 }}>{item?.name}</Text>
        {lastMessage && (
          <Text style={{ marginTop: 3, color: 'gray', fontWeight: 500 }}>
            {lastMessage?.message}
          </Text>
        )}
      </View>

      <View>
        <Text style={{ fontSize: 11, fontWeight: 400, color: '#585858' }}>
          {lastMessage && formatTime(lastMessage?.timeStamp)}
        </Text>
      </View>
    </Pressable>
  );
};

export default UserChat;

const styles = StyleSheet.create({});
