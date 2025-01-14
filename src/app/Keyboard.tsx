'use client'

import React, { useEffect } from "react";
import { HStack, StackSeparator, Kbd } from "@chakra-ui/react"
import { Keys, KeyMode } from './GameArea'
import Key from './Key'

const Keyboard = ({keyModes, focus}: {keyModes: Keys[], focus: string}) => {
  return (
    <HStack separator={<StackSeparator />}>
      {keyModes.map((keyMode: Keys) =>
       <Key key={keyMode.letter} highlight={(keyMode.letter == focus)? true : false}
            letter={keyMode.letter} mode={keyMode.mode}/>)} 
    </HStack>
  )
}

export default Keyboard;