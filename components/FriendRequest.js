import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import React, { useContext } from 'react';
import { UserType } from '../UserContext';
import { useNavigation } from '@react-navigation/native';
import { URL } from '../Url';

const FriendRequest = ({ item, FriendRequests, setFriendRequests }) => {
  const { userId, setUserId } = useContext(UserType);

  const navigation = useNavigation();
  const acceptRequest = async (friendRequestId) => {
    try {
      const response = await fetch(`${URL}/friend-request/accept`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          senderId: friendRequestId,
          recepientId: userId
        })
      });

      if (response.ok) {
        setFriendRequests(
          FriendRequests.filter((request) => request._id !== friendRequestId)
        );
        navigation.navigate('Chats');
      }
    } catch (error) {
      console.log('error accepting the friend request ', error);
    }
  };
  return (
    <Pressable
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginVertical: 10
      }}
    >
      <Image
        style={{ width: 50, height: 50, borderRadius: 25 }}
        source={{ uri: item.image }}
      />

      <Text
        style={{ fontSize: 15, fontWeight: 'bold', marginLeft: 10, flex: 1 }}
      >
        {item?.name} sent you a friend request
      </Text>
      <Pressable
        style={{ backgroundColor: '#0066b2', padding: 10, borderRadius: 6 }}
      >
        <Text
          onPress={() => acceptRequest(item._id)}
          style={{ textAlign: 'center', color: 'white' }}
        >
          Accept
        </Text>
      </Pressable>
    </Pressable>
  );
};

export default FriendRequest;

const styles = StyleSheet.create({});
