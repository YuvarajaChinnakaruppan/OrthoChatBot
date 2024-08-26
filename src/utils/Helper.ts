import {Dimensions} from 'react-native';

const generateUniqueRandomId = (length = 6) => {
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;

  let result;
  const usedIds = new Set(); // Store generated IDs for uniqueness

  do {
    result = '';
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
  } while (usedIds.has(result)); // Repeat until a unique ID is found

  usedIds.add(result);
  return result;
};

const formatDateTime = (date: Date) => {
  const day = date.getDate();
  const month = date.getMonth() + 1; // Months are zero-indexed
  const year = date.getFullYear();
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const period = hours >= 12 ? 'PM' : 'AM';
  const formattedHours = hours % 12 || 12; // Converts 0-23 hour format to 1-12
  const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes; // Adds leading zero if necessary

  return `${day}/${month}/${year} ${formattedHours}:${formattedMinutes} ${period}`;
};

const height = Dimensions.get('window').height;
const width = Dimensions.get('window').width;

export {generateUniqueRandomId, formatDateTime, height, width};
