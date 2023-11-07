import { useMemo } from "react";
import Resources from "./Resources";

const Blocks = ({ data }) => {
  const slugs = useMemo(() => data.map(el => el.slug), [data])

  if (slugs?.includes('resources')) return <Resources />

  return <></>
}

export default Blocks