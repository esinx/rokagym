import { SvgProps } from 'react-native-svg'

import BarbellIcon from '@/components/icons/Barbell'
import PushupIcon from '@/components/icons/Pushup'
import RunIcon from '@/components/icons/Run'
import SitupIcon from '@/components/icons/Situp'

const WorkoutIcon: React.FC<{ workoutTypeId: string } & SvgProps> = ({
	workoutTypeId,
	...passProps
}) => {
	const Icon =
		{
			run: RunIcon,
			situp: SitupIcon,
			pushup: PushupIcon,
			'3km-run': RunIcon,
			'2m-situp': SitupIcon,
			'2m-pushup': PushupIcon,
		}[workoutTypeId] ?? BarbellIcon
	return <Icon {...passProps} />
}

export default WorkoutIcon
