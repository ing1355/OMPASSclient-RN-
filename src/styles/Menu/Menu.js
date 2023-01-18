import React from 'react';
import {StyleSheet} from 'react-native';
import { RFPercentage } from 'react-native-responsive-fontsize';
import { NotoSansRegular } from '../../env';

export const menuWidth = 275

const styles = StyleSheet.create({
  menu_container: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor:'black',
  },
  menu_title: {
    height: 120
  },
  menu_sidebar: {
    zIndex: 2,
    width: menuWidth,
    transform: [{
      translateX: menuWidth
    }],
    height: '100%',
    alignSelf: 'flex-end',
    position: 'absolute',
    backgroundColor: 'white',
  },
  logo: {
    top: 40,
    left: 20,
    height: 35,
    width: 100,
    alignSelf:'flex-start'
  },
  menu_contents: {
    flex: 1
  },
  menu_button: {
    height: 60,
    justifyContent:'center',
    marginBottom: 20
  },
  menu_item_icon: {
    width: RFPercentage(4),
    height: RFPercentage(6),
    marginRight: 8
  },
  menu_item: {
    flexDirection:'row',
    alignItems:'center',
    paddingHorizontal: 20
  },
  menu_item_text: {
    color: '#265599',
    fontSize: RFPercentage(2.1),
    letterSpacing: -1
  },
  version_text: {
    position: 'absolute',
    bottom: 5,
    right: 30
  },
  feedback_container: {
    position: 'absolute',
    bottom: 30,
    right: 30
  },
  feedback_text: {
    color:'#0381FD',
    fontFamily: NotoSansRegular
  }
});

export default styles;
