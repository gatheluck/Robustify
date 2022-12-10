import Image from 'next/image'
import ClassNames from './ClassNames'

export const ImageContainer = ({
  src,
  alt,
  width,
  height,
  classNameDiv = '',
  classNameImage = '',
}) => {
  return (
    <div
      className={ClassNames(
        'm-8 flex justify-center rounded-lg shadow-lg',
        classNameDiv.length > 0 && classNameDiv
      )}
    >
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={ClassNames('rounded-lg ', classNameImage.length > 0 && classNameImage)}
      />
    </div>
  )
}
