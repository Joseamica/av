import type {MenuCategory} from '@prisma/client'
import clsx from 'clsx'
import {motion} from 'framer-motion'
import React from 'react'
import {Link} from 'react-router-dom'

type Props = {
  categories: MenuCategory[]
  isSticky?: boolean
  [key: string]: any
}

export function CategoriesBar({categories, isSticky, categoryId}: Props) {
  const categoryRefs = React.useRef<Record<string, HTMLAnchorElement>>({})

  React.useEffect(() => {
    if (categoryId && categoryRefs.current[categoryId]) {
      const categoryElement = categoryRefs.current[categoryId]
      const parentElement = categoryElement.parentElement
      if (parentElement) {
        const scrollPos =
          categoryElement.offsetLeft -
          parentElement.offsetWidth / 3 +
          categoryElement.offsetWidth / 2
        parentElement.scrollLeft = scrollPos
      }
    }
  }, [categoryId])
  return (
    <motion.div
      className={clsx(
        'no-scrollbar my-2 flex  items-center space-x-2 overflow-x-scroll whitespace-nowrap rounded-xl px-5 py-4 shadow-lg',
        {'sticky top-14 bg-white': isSticky},
      )}
    >
      {categories.map((category: MenuCategory) => (
        <Link
          ref={el => (categoryRefs.current[category.id] = el!)}
          to={`#${category.id}`}
          preventScrollReset
          key={category.id}
          className={clsx({
            'text-lg font-bold': category.id === categoryId, // Aplica el estilo si la categoría es la actual
          })}
        >
          {category.name}
        </Link>
      ))}
    </motion.div>
  )
}
