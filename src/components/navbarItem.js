import React, { Component } from "react"
import styles from "./navbarItem.module.scss"
import linkArrow from "../../static/images/linkArrow.png"
import Menu from "./menu.js"

class NavbarItem extends Component {
  state = { menuItemIsOpen: false, hasLinks: false }

  componentDidMount() {
    const { links } = this.props
    this.setState({
      hasLinks: links && links.length,
    })
  }

  Anchor = props => {
    const { menuItemIsOpen, hasLinks } = this.state
    if (hasLinks && !this.props.windowIsLarge) {
      return (
        <div
          className={`${styles.link} ${styles.fullWidth} ${menuItemIsOpen &&
            styles.bold}`}
        >
          {props.children}
        </div>
      )
    }

    return (
      <a
        className={`${styles.link} ${styles.fullWidth} ${hasLinks &&
          styles.disabled} ${hasLinks && menuItemIsOpen && styles.bold}`}
        href={this.props.endpoint}
      >
        {props.children}
      </a>
    )
  }

  render() {
    const { menuItemIsOpen, hasLinks } = this.state

    return (
      <li
        onClick={() => {
          if (hasLinks) {
            this.setState({ menuItemIsOpen: !menuItemIsOpen })
          }
        }}
        className={`${styles.item} ${this.props.hidden && styles.hidden} ${this
          .props.menuIsOpen && styles.open} ${this.props.submenu &&
          styles.submenu}`}
        key={`link item ${this.props.name}`}
      >
        <this.Anchor>
          <div className={`${styles.linkInner}`}>
            <span>{this.props.name}</span>
            <div className={styles.selected} />
          </div>
          {hasLinks || this.props.arrow ? (
            <img
              src={linkArrow}
              height="9.2px"
              width="15.5px"
              className={`${styles.arrow} ${menuItemIsOpen &&
                styles.openMenuItem}`}
            />
          ) : null}
        </this.Anchor>
        {hasLinks ? (
          <Menu menuIsOpen={this.state.menuItemIsOpen} submenu>
            {this.props.links.map(({ position, endpoint }) => {
              return <NavbarItem name={position} endpoint={endpoint} submenu />
            })}
          </Menu>
        ) : null}
      </li>
    )
  }
}

export default NavbarItem
