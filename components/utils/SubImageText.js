import ClassNames from './ClassNames'

export const SubImageText = ({ classNameDiv = '', classNameText = '', children }) => {
  return (
    <div
      className={ClassNames(
        'mx-auto -mt-8 -mb-8 flex w-max !p-0 text-center text-xs',
        classNameDiv.length > 0 && classNameDiv
      )}
    >
      <span className={ClassNames('w-60 lg:w-[600px]', classNameText.length > 0 && classNameText)}>
        {children}
      </span>
    </div>
  )
}
