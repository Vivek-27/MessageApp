import { Pressable, StyleSheet, Text, View } from 'react-native';
import React, { useContext, useEffect, useLayoutEffect, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { UserType } from '../UserContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import jwt_decode from 'jwt-decode';
import axios from 'axios';
import User from '../components/User';
import { URL } from '../Url';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const HomeScreen = () => {
  const navigation = useNavigation();
  const { userId, setUserId } = useContext(UserType);
  const [users, setUsers] = useState([]);
  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: '',
      headerLeft: () => (
        <>
          <Pressable
            onPress={() => {
              AsyncStorage.setItem('authToken', '');
            }}
          >
            <MaterialCommunityIcons
              name="logout"
              size={24}
              color="#6495ED"
              style={{ paddingRight: 7 }}
            />
          </Pressable>

          <Text style={{ fontSize: 16, fontWeight: 'bold' }}>Swift Chat</Text>
        </>
      ),
      headerRight: () => (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Ionicons
            onPress={() => navigation.navigate('Chats')}
            name="chatbox-ellipses-outline"
            size={24}
            color="black"
          />
          <Ionicons
            onPress={() => navigation.navigate('Friends')}
            name="people-outline"
            size={24}
            color="black"
          />
        </View>
      )
    });
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      const token = await AsyncStorage.getItem('authToken');
      const decodedToken = jwt_decode(token);
      const userId = decodedToken.userId;
      setUserId(userId);

      axios
        .get(`${URL}/users/${userId}`)
        .then((res) => {
          setUsers(res.data);
        })
        .catch((err) => {
          console.log('error retrieving users ', err);
        });
    };

    fetchUsers();
  }, []);

  return (
    <View>
      <View style={{ padding: 10 }}>
        {users.map((item, index) => (
          <User key={index} item={item} />
        ))}
      </View>
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({});
