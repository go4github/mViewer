import React from 'react'
import dashStyles from './dashBoard.css'
import $ from 'jquery'
import SideNav from '../sidenav/SideNavComponent.jsx';
import service from '../../gateway/service.js';

class DashBoardComponent extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      connectionId:this.props.location.query.connectionId,
    }
  }

  disconnect(){
    var partialUrl = 'disconnect?connectionId=' + this.state.connectionId;
    var disconnectCall = service('GET', partialUrl, '');
    disconnectCall.then(this.success.bind(this), this.failure.bind(this));
  }

  success(data) {
    if(data.response.result==='User Logged Out')
      {
          window.location.hash = '#';
      }
  }

  failure() {

  }

  refreshDb(){
    this.refs.sideNav.refreshDb();
  }

  clearActiveClass(){
    this.refs.sideNav.clearActiveClass();
  }

  render() {
    const childrenWithProps = React.Children.map(this.props.children,
      (child) => React.cloneElement(child, {
      connectionId: this.state.connectionId,
      refreshDb: function(){
        this.refreshDb();
      }.bind(this)
     })
    );

    return (
      <div className ='row'>
        <div className = {dashStyles.mainContainer}>
          <header>
            <nav>
              <div className={"row " + dashStyles.row}>
                <a href= {"#/dashboard/home?collapsed=false&connectionId="+this.state.connectionId} className={dashStyles.logo} onClick={this.clearActiveClass.bind(this)}><span className={dashStyles.span1}>m</span><span className={dashStyles.span2}>Viewer</span><span className={dashStyles.span3}></span></a>
                <ul className={dashStyles.mainNav + ' ' + dashStyles.clearfix} >
                  <li><a href="#mongoGraphs"><span>Mongo Graph</span></a></li>
                  <li><a href="#serverStatics"><span>Server Statistics</span></a></li>
                  <li className={dashStyles.disconnect}><a href="javascript:void(0);" onClick={this.disconnect.bind(this)}><span><i className="fa fa-sign-out" aria-hidden="true"></i></span></a></li>
                </ul>
               </div>
             </nav>
          </header>
          <SideNav ref='sideNav' connectionId = {this.state.connectionId} propss = {this.props}></SideNav>
          {childrenWithProps}
        </div>
      </div>
    );
  }
}

export default DashBoardComponent;
