import { IconSquarePlus } from '@tabler/icons-react'
import React from 'react'

function LsPageHeader({title,icon}) {
    return (
        <div style={{ display: 'flex', flexDirection:"row",alignItems:'center'}}>
            {icon}
            <h3 style={{marginLeft:"10px"}}>{title}</h3>
      </div>
  )
}

export default LsPageHeader