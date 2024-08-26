import {StyleSheet, Text} from 'react-native';
import React from 'react';
import {height} from '../utils/Helper';

const ListEmptyComponent = () => {
  return <Text style={styles.emptyMsg}>No Messages</Text>;
};

export default ListEmptyComponent;

const styles = StyleSheet.create({
  emptyMsg: {
    fontSize: 16,
    color: 'grey',
    alignSelf: 'center',
    justifyContent: 'center',
    marginTop: height / 2.6,
  },
});
