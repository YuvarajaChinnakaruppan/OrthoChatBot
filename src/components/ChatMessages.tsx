import {Image, StyleSheet, Text, View} from 'react-native';
import React from 'react';

export type Message = {
  id?: string;
  text: string;
  loading?: boolean;
  createdAt: string;
  creator: string;
};

const ChatMessages = ({item}: {item: Message}) => {
  return (
    <View style={styles.msgContainer}>
      {item?.creator === 'USER' ? (
        <View style={styles.userContainer}>
          <View style={styles.userMsgContainer}>
            <View style={styles.userTextContainer}>
              <Text>{item.text}</Text>
            </View>
            <Text style={[styles.dtText, styles.dtRText]}>
              {item.createdAt}
            </Text>
          </View>
          <View style={styles.avatarWrapper}>
            <Image
              source={{
                uri: 'https://w7.pngwing.com/pngs/178/595/png-transparent-user-profile-computer-icons-login-user-avatars-thumbnail.png',
              }}
              style={styles.avatarStyle}
            />
          </View>
        </View>
      ) : (
        <View style={styles.botContainer}>
          <View style={styles.avatarWrapper}>
            <Image
              source={{
                uri: 'https://w7.pngwing.com/pngs/983/399/png-transparent-computer-icons-internet-bot-robot-robot-thumbnail.png',
              }}
              style={styles.avatarStyle}
            />
          </View>
          <View style={styles.botMsgContainer}>
            <View style={styles.botTextContainer}>
              <Text>{item.text === '' ? '...' : item.text}</Text>
            </View>
            <Text style={styles.dtText}>{item.createdAt}</Text>
          </View>
        </View>
      )}
    </View>
  );
};

export default ChatMessages;

const styles = StyleSheet.create({
  msgContainer: {flex: 1, margin: 10},
  dtText: {fontSize: 8, marginHorizontal: 5, marginVertical: 5},
  dtRText: {alignSelf: 'flex-end'},
  avatarStyle: {width: 20, height: 20, backgroundColor: 'white'},
  avatarWrapper: {
    width: 30,
    height: 30,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    marginTop: 5,
  },
  userContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  botContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  userMsgContainer: {justifyContent: 'flex-end', marginRight: 5},
  botMsgContainer: {flex: 1, marginLeft: 5},
  userTextContainer: {
    backgroundColor: 'lightblue',
    padding: 10,
    borderRadius: 16,
    alignSelf: 'flex-end',
  },
  botTextContainer: {
    backgroundColor: 'rgb(233,223,242)',
    padding: 10,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
});
