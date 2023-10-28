import {
  Image,
  KeyboardAvoidingView,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native';
import React, {
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState
} from 'react';
import { Entypo } from '@expo/vector-icons';
import { Feather } from '@expo/vector-icons';
import EmojiSelector from 'react-native-emoji-selector';
import { UserType } from '../UserContext';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { MaterialIcons } from '@expo/vector-icons';
import { FontAwesome } from '@expo/vector-icons';
import { URL } from '../Url';

import * as ImagePicker from 'expo-image-picker';

const ChatMessageScreen = () => {
  const [showEmojiSelector, setShowEmojiSelector] = useState(false);
  const [selectedImage, setSelectedImage] = useState('');
  const [messages, setMessages] = useState([]);
  const [recepientData, setRecepientData] = useState();
  const navigation = useNavigation();
  const [message, setMessage] = useState('');
  const [selectedMessages, setSelectedMessages] = useState([]);
  const route = useRoute();
  const { recepientId } = route.params;
  const { userId, setUserID } = useContext(UserType);
  const scrollViewRef = useRef(null);

  useEffect(() => {
    scrollToBottom();
  }, []);

  const scrollToBottom = () => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: false });
    }
  };

  const handleContentSizeChange = () => {
    scrollToBottom();
  };
  const handleEmojiPress = () => {
    setShowEmojiSelector(!showEmojiSelector);
  };

  const fetchMessages = async () => {
    try {
      const response = await fetch(`${URL}/message/${userId}/${recepientId}`);
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
  useEffect(() => {
    fetchMessages();
  });

  useEffect(() => {
    const fetchRecepientData = async () => {
      try {
        const response = await fetch(`${URL}/user/${recepientId}`);
        const data = await response.json();
        setRecepientData(data);
      } catch (error) {
        console.log('error retrieving details', error);
      }
    };
    fetchRecepientData();
  }, []);

  const handleSend = async (messageType, imageUri) => {
    try {
      const formData = new FormData();
      formData.append('senderId', userId);
      formData.append('recepientId', recepientId);

      //if the message type is image or text
      if (messageType === 'image') {
        formData.append('messageType', 'image');
        formData.append('imageFile', {
          uri: imageUri,
          name: 'image.jpg',
          type: 'image/jpeg'
        });
      } else {
        formData.append('messageType', 'text');
        formData.append('messageText', message);
      }

      const response = await fetch(`${URL}/messages`, {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        setMessage('');
        setSelectedImage('');
        fetchMessages();
      }
    } catch (error) {
      console.log('error in sending the message ', error);
    }
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: '',
      headerLeft: () => (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <Ionicons
            onPress={() => navigation.goBack()}
            name="arrow-back"
            size={24}
            color="black"
          />
          {selectedMessages.length > 0 ? (
            <View>
              <Text style={{ fontSize: 16, fontWeight: '500' }}>
                {selectedMessages.length}
              </Text>
            </View>
          ) : (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Image
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 15,
                  resizeMode: 'cover'
                }}
                source={{ uri: recepientData?.image }}
              />
              <Text style={{ marginLeft: 5, fontSize: 15, fontWeight: 'bold' }}>
                {recepientData?.name}
              </Text>
            </View>
          )}
        </View>
      ),
      headerRight: () =>
        selectedMessages.length > 0 ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Ionicons name="md-arrow-redo-sharp" size={24} color="black" />
            <Ionicons name="md-arrow-undo" size={24} color="black" />
            <FontAwesome name="star" size={24} color="black" />
            <MaterialIcons
              onPress={() => deleteMessages(selectedMessages)}
              name="delete"
              size={24}
              color="black"
            />
          </View>
        ) : null
    });
  }, [recepientData, selectedMessages]);

  const deleteMessages = async (messageIds) => {
    try {
      const response = await fetch(`${URL}/deleteMessages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ messages: messageIds })
      });

      if (response.ok) {
        setSelectedMessages((prevMsgs) =>
          prevMsgs.filter((id) => !messageIds.includes(id))
        );
        fetchMessages();
      } else {
        console.log('error deleting messages', response.status);
      }
    } catch (error) {
      console.log('error deleting message', error);
    }
  };

  const formatTime = (time) => {
    const options = { hour: 'numeric', minute: 'numeric' };
    return new Date(time).toLocaleString('en-Us', options);
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1
    });

    if (!result.canceled) {
      handleSend('image', result.assets[0].uri);
    }
  };

  const handleSelectMessage = (message) => {
    //check if the message is already selected
    const isSelected = selectedMessages.includes(message._id);

    if (isSelected) {
      setSelectedMessages((previousMessages) =>
        previousMessages.filter((id) => id !== message._id)
      );
    } else {
      setSelectedMessages((prev) => [...prev, message._id]);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: '#F0F0F0' }}>
      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={{ flexGrow: 1 }}
        onContentSizeChange={handleContentSizeChange}
      >
        {messages.map((item, index) => {
          if (item.messageType === 'text') {
            const isSelected = selectedMessages.includes(item._id);
            return (
              <Pressable
                onLongPress={() => handleSelectMessage(item)}
                key={index}
                style={[
                  item?.senderId?._id === userId
                    ? {
                        alignSelf: 'flex-end',
                        backgroundColor: '#DCF8C6',
                        padding: 8,
                        maxWidth: '60%',
                        borderRadius: 7,
                        margin: 10
                      }
                    : {
                        alignSelf: 'flex-start',
                        backgroundColor: 'white',
                        padding: 8,
                        margin: 10,
                        borderRadius: 7,
                        maxHeight: '60%'
                      },

                  isSelected && { width: '100%', backgroundColor: '#F0FFFF' }
                ]}
              >
                <Text
                  style={{
                    fontSize: 13,
                    textAlign: isSelected ? 'right' : 'left'
                  }}
                >
                  {item?.message}
                </Text>
                <Text
                  style={{
                    textAlign: 'right',
                    fontSize: 9,
                    color: 'gray',
                    marginTop: 5
                  }}
                >
                  {formatTime(item.timeStamp)}
                </Text>
              </Pressable>
            );
          }

          if (item.messageType === 'image') {
            const baseUrl =
              'Users/vivekDesktop/nativemessenger-project/api/files/';
            const imageUrl = item.imageUrl;
            const filename = imageUrl.split('\\').pop();
            const source = { uri: baseUrl + filename };

            return (
              <Pressable
                key={index}
                style={[
                  item?.senderId?._id === userId
                    ? {
                        alignSelf: 'flex-end',
                        backgroundColor: '#DCF8C6',
                        padding: 8,
                        maxWidth: '60%',
                        borderRadius: 7,
                        margin: 10
                      }
                    : {
                        alignSelf: 'flex-start',
                        backgroundColor: 'white',
                        padding: 8,
                        margin: 10,
                        borderRadius: 7,
                        maxHeight: '60%'
                      }
                ]}
              >
                <View>
                  <Image
                    source={require('../api/files/1698476731297_1000000001-image.jpg')}
                    style={{ width: 200, height: 200, borderRadius: 7 }}
                  />

                  <Text
                    style={{
                      textAlign: 'right',
                      fontSize: 9,
                      position: 'absolute',
                      bottom: 7,
                      right: 10,
                      color: 'white',
                      marginTop: 5
                    }}
                  >
                    {formatTime(item?.timeStamp)}
                  </Text>
                </View>
              </Pressable>
            );
          }
        })}
      </ScrollView>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 10,
          paddingVertical: 10,
          borderTopWidth: 1,
          borderTopColor: '#dddddd',
          marginBottom: showEmojiSelector ? 0 : 25
        }}
      >
        <Entypo
          onPress={handleEmojiPress}
          style={{ marginRight: 5 }}
          name="emoji-happy"
          size={24}
          color="gray"
        />
        <TextInput
          value={message}
          onChangeText={(text) => setMessage(text)}
          style={{
            flex: 1,
            height: 40,
            borderWidth: 1,
            borderColor: '#dddddd',
            borderRadius: 20,
            paddingHorizontal: 10
          }}
          placeholder="Type your message..."
        />
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 7,
            marginHorizontal: 8
          }}
        >
          <Entypo onPress={pickImage} name="camera" size={24} color="gray" />
          <Feather name="mic" size={24} color="gray" />
        </View>
        <Pressable
          onPress={() => handleSend('text')}
          style={{
            backgroundColor: '#007bff',
            paddingVertical: 8,
            paddingHorizontal: 12,
            borderRadius: 20
          }}
        >
          <Text
            style={{
              color: 'white',
              fontWeight: 'bold'
            }}
          >
            Send
          </Text>
        </Pressable>
      </View>
      <View>
        {showEmojiSelector && (
          <EmojiSelector
            onEmojiSelected={(emoji) =>
              setMessage((prevMessage) => prevMessage + emoji)
            }
            style={{ height: 250 }}
          />
        )}
      </View>
    </KeyboardAvoidingView>
  );
};

export default ChatMessageScreen;

const styles = StyleSheet.create({});
