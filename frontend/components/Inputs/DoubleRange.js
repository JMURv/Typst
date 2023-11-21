import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import useTranslation from "next-translate/useTranslation";


export default function DoubleRange({label, maxValue, minValue, rangeValues, setRangeValues}) {
    const { t } = useTranslation('user')
    const handleRangeChange = (values) => {
        setRangeValues(values)
    }
    return (
        <div className={`flex flex-col gap-1`}>
            {label && (
                <p className={`font-medium text-center`}>{label}</p>
            )}
            <div className={`w-full flex flex-row gap-3 items-center justify-center text-center font-medium`}>
                <p className={`w-[10%]`}>{rangeValues[0]}</p>
                <Slider
                    range
                    min={minValue}
                    max={maxValue}
                    step={1}
                    defaultValue={[rangeValues[0], rangeValues[1]]}
                    value={rangeValues}
                    onChange={handleRangeChange}
                    allowCross={false}
                    className={`rail w-[80%]`}
                />
                <p className={`w-[10%]`}>{rangeValues[1]}</p>
            </div>
        </div>

    );
}
