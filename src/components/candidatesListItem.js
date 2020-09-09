import React from "react"
import { Link } from "gatsby"
import Bar from "./bar"
import styles from "./candidatesListItem.module.scss"

const percentFormatter = Intl.NumberFormat("en-US", { style: "percent" })

function formatPercent(value) {
  return percentFormatter.format(value)
}

export default ({ Name, fields: { slug } }) => {
  const percent = formatPercent(83455 / 123456)
  return (
    <Link className={styles.container} key={slug} to={"/candidate/" + slug}>
      <img
        height="12.5rem"
        width="12.5rem"
        src="https://picsum.photos/125"
        alt={`Headshot of candidate ${Name}`}
      />
      <div className={styles.candidate}>
        <div className={styles.textInfo}>
          <div className={styles.candidateInfo}>
            <h1 className={styles.headerText}>{Name}</h1>
            <p className={styles.label}>CurrentJob</p>
          </div>
          <div className={styles.totalRaised}>
            <p className={styles.label}>Total raised</p>
            <h2 className={styles.headerText}>$123,456</h2>
          </div>
        </div>
        <div className={styles.visualization}>
          <Bar type="contributions" percent={percent} />
        </div>
      </div>
    </Link>
  )
}
