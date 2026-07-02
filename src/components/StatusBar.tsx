interface Props {
  status: string
}

/** Bottom chrome: last action / hint on the left, key hints on the right. */
export function StatusBar({ status }: Props) {
  return (
    <div className="sbar">
      <span>{status}</span>
      <span style={{ marginLeft: 'auto', opacity: 0.6 }}>← → to browse · drag the wireframe to orbit</span>
    </div>
  )
}
