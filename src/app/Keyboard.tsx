'use client'

import React, { useEffect } from "react";
import { HStack, StackSeparator, Kbd } from "@chakra-ui/react"
import Key from './Key'

const Keyboard = ({keys, focus}: {keys: Array<string>, focus: string}) => {
  return (
    <HStack separator={<StackSeparator />}>
      {keys.map((key: string) =>
       <Key key={key} highlight={(key == focus)? true : false}
            letter={key}/>)}
    </HStack>
  )
}

export default Keyboard;