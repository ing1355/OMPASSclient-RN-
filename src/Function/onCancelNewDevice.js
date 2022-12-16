import RNFetchBlob from "rn-fetch-blob";

export function onCancelNewDevice({fidoAddress, did, username, callback}) {
    RNFetchBlob.fetch(
      'POST',
      'https://' + fidoAddress + `/client-info/is-progress/did/${did}/username/${username}`,
      { 'Content-Type': 'application/json' }
    ).then(resp => {
      if (callback) callback();
    })
  }