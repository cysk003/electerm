import React from 'react'
import { FrownOutlined, ReloadOutlined } from '@ant-design/icons'
import { Button } from 'antd'
import {
  logoPath1
} from '../../common/constants'

const e = window.translate

export default class ErrorBoundary extends React.PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      hasError: false,
      error: {}
    }
  }

  componentDidCatch (error) {
    log.error(error)
    this.setState({
      hasError: true,
      error
    })
  }

  handleReload = () => {
    window.location.reload()
  }

  render () {
    if (this.state.hasError) {
      const { stack, message } = this.state.error
      return (
        <div className='pd3 aligncenter error-wrapper'>
          <div className='pd2y aligncenter'>
            <img src={logoPath1} className='iblock mwm-100' />
          </div>
          <h1>
            <FrownOutlined className='mg1r iblock' />
            <span className='iblock mg1r'>{e('error')}</span>
            <Button
              onClick={this.handleReload}
              className='iblock'
              icon={<ReloadOutlined />}
            >
              {e('reload')}
            </Button>
          </h1>
          <div className='pd1y'>{message}</div>
          <div className='pd1y'>{stack}</div>
        </div>
      )
    }
    return this.props.children
  }
}
