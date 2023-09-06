import { useFetcher } from '@remix-run/react'

import type { Branch } from '@prisma/client'

import { QueryDialog } from './dialog'

export default function SelectBranchDialog({ selectedChain, isBranches }) {
  const fetcher = useFetcher()

  return (
    <QueryDialog query="chainId" title={selectedChain?.name} description="Select Branch">
      {selectedChain && isBranches ? (
        <fetcher.Form method="POST">
          <fieldset className="mb-[15px] flex items-center gap-5">
            {/* <label className="text-violet11 w-[90px] text-right text-[15px]" htmlFor="branch">
                     Branch
                   </label> */}
            <select
              className="text-violet11 shadow-violet7 focus:shadow-violet8 inline-flex h-[35px] w-full flex-1 items-center justify-center rounded-[4px] px-[10px] text-[15px] leading-none shadow-[0_0_0_1px] outline-none focus:shadow-[0_0_0_2px]"
              id="branch"
              name="branchId"
            >
              {selectedChain &&
                selectedChain.branches.map((branch: Branch, index) => (
                  <option key={index} value={branch.id}>
                    {branch.name}
                  </option>
                ))}
            </select>
          </fieldset>
          <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded">
            Submit
          </button>
        </fetcher.Form>
      ) : (
        <div className="flex flex-col items-center justify-center">
          <p className="text-violet11 text-[15px] leading-normal">No Branches</p>
        </div>
      )}
    </QueryDialog>
  )
}
