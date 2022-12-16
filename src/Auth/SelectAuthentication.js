import BioMetric from "./BioMetric";
import Pin from './Pin';
import Pattern from './Pattern';
import Face from "./Face";
import Fingerprint from "./Fingerprint";

export default function SelectAuthentication(type, callback) {
    switch (type) {
        case 'biometrics':
            return BioMetric({ callback });
        case 'pattern':
            return Pattern({ callback });
        case 'pin':
            return Pin({ callback });
        case 'face':
            return Face({ callback });
        case 'fingerprint':
            return Fingerprint({ callback });
        default:
            return false;
    }
}