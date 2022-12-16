import React from 'react';
import {Image} from 'react-native';

const MenuButton = () => {
  return (
    <Image
      source={require('../../assets/menu_btn.png')}
      resizeMode="contain"
      style={{width: '45%', height: '100%'}}
    />
  );
};

export default MenuButton;