// Tests run in the dark scheme unless a test says otherwise (the colour checks name the palette).
import { Appearance } from 'react-native';

jest.spyOn(Appearance, 'getColorScheme').mockReturnValue('dark');
