import BioMetric from "./BioMetric";
import Pin from './Pin';
import Pattern from './Pattern'
import Face from './Face';
import Fingerprint from './Fingerprint';

export default function RegisterAuthentication(auth, callback, cancelCallback, isQR) {
    switch(auth) {
        case 'biometrics':
            return BioMetric({type: "등록", callback, cancelCallback, isQR});
        case 'pattern':
            return Pattern({type: "등록", callback, cancelCallback, isQR});
        case 'pin':
            return Pin({type: "등록", callback, cancelCallback, isQR});
        case 'face':
            return Face({type: "등록", callback, cancelCallback, isQR});
        case 'fingerprint':
            return Fingerprint({type: "등록", callback, cancelCallback, isQR});
        default:
            return false;
    }
}