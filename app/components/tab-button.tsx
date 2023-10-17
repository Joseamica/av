import * as Tabs from '@radix-ui/react-tabs'
import React from 'react'

export function CustomTabs({ tabLabels, tabContents }) {
  // Ensure that there is a matching number of labels and contents
  if (tabLabels.length !== tabContents.length) {
    throw new Error('Mismatch between tab labels and contents')
  }

  return (
    <Tabs.Root className="flex flex-col w-[300px] shadow-[0_2px_10px] shadow-blackA4" defaultValue="tab1">
      <Tabs.List className="flex border-b rounded-xl shrink-0 border-mauve6" aria-label="Manage your account">
        {tabLabels.map((label, index) => (
          <Tabs.Trigger
            key={index}
            className="bg-white px-5 h-[45px] flex-1 flex items-center justify-center text-[15px] leading-none text-mauve11 select-none first:rounded-tl-md last:rounded-tr-md hover:text-violet11 data-[state=active]:text-violet11 data-[state=active]:shadow-[inset_0_-1px_0_0,0_1px_0_0] data-[state=active]:shadow-current data-[state=active]:focus:relative data-[state=active]:focus:shadow-[0_0_0_2px] data-[state=active]:focus:shadow-black outline-none cursor-default"
            value={`tab${index + 1}`}
          >
            {label}
          </Tabs.Trigger>
        ))}
      </Tabs.List>
      {tabContents.map((Content, index) => (
        <Tabs.Content
          key={index}
          className="grow p-5 bg-white rounded-xl outline-none focus:shadow-[0_0_0_2px] focus:shadow-black"
          value={`tab${index + 1}`}
        >
          <Content />
        </Tabs.Content>
      ))}
    </Tabs.Root>
  )
}
