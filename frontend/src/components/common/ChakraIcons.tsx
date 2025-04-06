import React, { forwardRef } from 'react'
import { createIcon, Icon, IconProps } from '@chakra-ui/react'

// Spinner icon with animation
export const Spinner = forwardRef<SVGSVGElement, IconProps>((props, ref) => (
  <Icon ref={ref} viewBox="0 0 24 24" {...props}>
    <path
      fill="currentColor"
      d="M12,4a8,8,0,0,1,7.89,6.7A1.53,1.53,0,0,0,21.38,12h0a1.5,1.5,0,0,0,1.48-1.75,11,11,0,0,0-21.72,0A1.5,1.5,0,0,0,2.62,12h0a1.53,1.53,0,0,0,1.49-1.3A8,8,0,0,1,12,4Z"
    >
      <animateTransform
        attributeName="transform"
        type="rotate"
        dur="0.75s"
        values="0 12 12;360 12 12"
        repeatCount="indefinite"
      />
    </path>
  </Icon>
));

Spinner.displayName = 'Spinner';

// Add Icon
export const AddIcon = createIcon({
  displayName: 'AddIcon',
  viewBox: '0 0 24 24',
  path: (
    <path
      fill="currentColor"
      d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"
    />
  ),
})

// Delete Icon
export const DeleteIcon = createIcon({
  displayName: 'DeleteIcon',
  viewBox: '0 0 24 24',
  path: (
    <path
      fill="currentColor"
      d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"
    />
  ),
})

// Edit Icon
export const EditIcon = createIcon({
  displayName: 'EditIcon',
  viewBox: '0 0 24 24',
  path: (
    <path
      fill="currentColor"
      d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"
    />
  ),
})

// Alert Icon
export const AlertIcon = createIcon({
  displayName: 'AlertIcon',
  viewBox: '0 0 24 24',
  path: (
    <path
      fill="currentColor"
      d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"
    />
  ),
}) 