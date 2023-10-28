import {
  Alert,
  KeyboardAvoidingView,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native';
import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { URL } from '../Url';

const RegisterScreen = () => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [image, setImage] = useState('');
  const navigation = useNavigation();

  const handleRegister = async () => {
    const user = {
      name: name,
      email: email,
      password: password,
      image: image
    };

    await axios
      .post(`${URL}/register`, user)
      .then((res) => {
        console.log(res);
        Alert.alert(
          'Registration successful',
          'You have been registered Successfully'
        );
        setName('');
        setEmail('');
        setPassword('');
        setPassword('');
      })
      .catch((err) => {
        Alert.alert(
          'Registration Error',
          'An error occured while registration'
        );
        console.log('Registration failed ', err);
      });
  };
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: 'white',
        padding: 10,
        alignItems: 'center'
      }}
    >
      <KeyboardAvoidingView>
        <View
          style={{
            marginTop: 100,
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          <Text
            style={{
              color: '#4A55A2',
              fontSize: 17,
              fontWeight: '600'
            }}
          >
            Regsister
          </Text>
          <Text style={{ fontSize: 17, fontWeight: '600', marginTop: 15 }}>
            Register to Your Account
          </Text>
        </View>
        <View style={{ marginTop: 50 }}>
          <View>
            <Text style={{ fontSize: 18, fontWeight: '600', color: 'gray' }}>
              Name
            </Text>
            <TextInput
              value={name}
              onChangeText={(text) => setName(text)}
              style={{
                fontSize: email ? 18 : 18,
                borderBottomColor: 'gray',
                borderBottomWidth: 1,
                marginVertical: 10,
                width: 300
              }}
              placeholderTextColor={'black'}
              placeholder="Enter Your Name"
            />
          </View>
          <View style={{ marginTop: 10 }}>
            <Text style={{ fontSize: 18, fontWeight: '600', color: 'gray' }}>
              Email
            </Text>
            <TextInput
              value={email}
              onChangeText={(text) => setEmail(text)}
              style={{
                fontSize: email ? 18 : 18,
                borderBottomColor: 'gray',
                borderBottomWidth: 1,
                marginVertical: 10,
                width: 300
              }}
              placeholderTextColor={'black'}
              placeholder="Enter Your Email"
            />
          </View>

          <View style={{ marginTop: 10 }}>
            <Text style={{ fontSize: 18, fontWeight: '600', color: 'gray' }}>
              Password
            </Text>
            <TextInput
              value={password}
              onChangeText={(text) => setPassword(text)}
              secureTextEntry={true}
              style={{
                fontSize: email ? 18 : 18,
                borderBottomColor: 'gray',
                borderBottomWidth: 1,
                marginVertical: 10,
                width: 300
              }}
              placeholderTextColor={'black'}
              placeholder="Enter Your  Password"
            />
          </View>
          <View style={{ marginTop: 10 }}>
            <Text style={{ fontSize: 18, fontWeight: '600', color: 'gray' }}>
              Image
            </Text>
            <TextInput
              value={image}
              onChangeText={(text) => setImage(text)}
              style={{
                fontSize: email ? 18 : 18,
                borderBottomColor: 'gray',
                borderBottomWidth: 1,
                marginVertical: 10,
                width: 300
              }}
              placeholderTextColor={'black'}
              placeholder="Image"
            />
          </View>

          <Pressable
            onPress={handleRegister}
            style={{
              width: 200,
              backgroundColor: '#4A55A2',
              padding: 15,
              marginTop: 50,
              marginLeft: 'auto',
              marginRight: 'auto',
              borderRadius: 6
            }}
          >
            <Text
              style={{
                color: 'white',
                fontSize: 16,
                fontWeight: 'bold',
                textAlign: 'center'
              }}
            >
              Register
            </Text>
          </Pressable>
          <Pressable
            onPress={() => navigation.goBack()}
            style={{ marginTop: 15 }}
          >
            <Text style={{ textAlign: 'center', color: 'gray', fontSize: 16 }}>
              Already have an account? Sign In
            </Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

export default RegisterScreen;

const styles = StyleSheet.create({});
