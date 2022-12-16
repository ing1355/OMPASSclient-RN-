import React from 'react';
import {Platform, StyleSheet} from 'react-native';
import { RFPercentage } from 'react-native-responsive-fontsize';

const styles = StyleSheet.create({
  setting_change_text_container: {
    flex: 0.5,
    backgroundColor: 'rgba(147,215,255,0.2)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: '6%',
    minHeight: '5%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  setting_change_text: {
    flex: 10,
    textAlignVertical: 'center',
    left: '50%',
    letterSpacing: -1,
    fontSize: RFPercentage(2.5),
  },
  modal_title: {
    height: 80,
    marginHorizontal: '5%',
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    borderBottomColor: 'gray',
    borderBottomWidth: 0.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal_title_text: {
    flex: 8,
    textAlignVertical: 'center',
    textAlign: 'left',
    fontFamily: 'NotoSans-Bold',
    fontSize: RFPercentage(2.3),
    color: '#333333',
    letterSpacing: -1,
  },
  setting_modal: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: Platform.OS === 'android' ? 0 : 20
},
});

export default styles;
