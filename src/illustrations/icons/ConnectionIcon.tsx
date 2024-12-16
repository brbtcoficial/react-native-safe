import React from 'react';
import { StyleSheet, View } from 'react-native';

type ConnectionIconProps = {
  connected?: boolean;
};

const ConnectionIcon = (props: ConnectionIconProps): JSX.Element => {
  return (
    <View
      style={StyleSheet.compose(
        styles.icon,
        props.connected === true ? styles.connected : styles.disconnected
      )}
    />
  );
};

const styles = StyleSheet.create({
  icon: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  connected: {
    backgroundColor: 'green',
  },
  disconnected: {
    backgroundColor: 'red',
  },
});

export default ConnectionIcon;
