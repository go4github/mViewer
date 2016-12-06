import React from 'react';
import collectionsStyles from './collections.css';
import QueryExecutor from '../query-executor/QueryExecutorComponent.jsx';
import CollectionList from '../collection-list/CollectionListComponent.jsx';
import GridFSList from '../gridfs-list/GridFSListComponent.jsx';
import DbStats from '../db-stats/DbStatsComponent.jsx';
import UserList from '../user-list/UserListComponent.jsx';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import UserDetails from '../user-details/UserDetailsComponent.jsx';
import privilegesAPI from '../../gateway/privileges-api.js';

class CollectionsComponent extends React.Component {

  constructor(props) {
      super(props);
      this.state = {
        selectedTab : 0,
        showQueryExecutor: false,
        selectedCollection: '',
        userDetails: [],
        hasListColPriv: null,
        navMessage:'Collections',
        _isMounted: false
      };
      this.refreshRespectiveData = this.refreshRespectiveData.bind(this);
      this.refreshCollectionList = this.refreshCollectionList.bind(this);
      this.setStates = this.setStates.bind(this);
      this.handleSelect = this.handleSelect.bind(this);
  }

  handleSelect(index){
    this.setState({selectedTab:index}, function(){
    });
    if (index == 0){
      this.setState({navMessage : 'Collections'});
    }
    else if (index == 1){
      this.setState({navMessage : 'GridFS'});
    }
    else if (index == 2){
      this.setState({navMessage : 'Users'});
    }
    else if (index == 3){
      this.setState({navMessage : 'Statistics'});
    }

    this.setState({hasListColPriv : privilegesAPI.hasPrivilege('listCollections' , '' , this.props.location.query.db)});
  }

  showQueryExecutor = () =>{
    this.setState({showQueryExecutor: true});
  }

  componentWillReceiveProps(nextProps){

    Tabs.setUseDefaultStyles(false);
    this.setState({selectedTab:0});
    this.setState({showQueryExecutor: false});
    this.setState({selectedCollection: ''});
    this.setState({navMessage : 'Collections'});
  
    if (this.props.location.query.db  != nextProps.location.query.db){

      this.setState({hasListColPriv: null});
      setTimeout(() => {
        if (this.state._isMounted == true){
          this.setState({hasListColPriv : privilegesAPI.hasPrivilege('listCollections' , '' , this.props.location.query.db)}, function(){
          }); 
        }
      }, 500);
    }
  }


  componentDidMount (){
    this.setState({_isMounted : true});
    setTimeout(() => {
      if (this.state._isMounted == true){
       this.setState({hasListColPriv : privilegesAPI.hasPrivilege('listCollections' , '' , this.props.location.query.db)}, function(){ });
      }     
    }, 500);
  
  }

  componentWillUnmount (){
    /* eslint-disable */ 
    this.state._isMounted = false;
    /* eslint-enable */
  }

  setStates(collection, data){
    if(data != undefined && data != null) {
      this.setState({userDetails: data});
    }
    this.setState({selectedCollection: collection});
    this.setState({showQueryExecutor: true});
  }

  hideQueryExecutor = () => {
    this.setState({showQueryExecutor: false});
  }

  switchTab = () => {
    this.setState({showQueryExecutor: false});
  }

  refreshCollectionList(showQueryExecutor){
    if(typeof(this.refs.left) != 'undefined'){
      this.refs.left.refreshCollectionList(this.props.location.query.db);
    }
    if(showQueryExecutor==false){
      this.setState({showQueryExecutor:showQueryExecutor});
    }
  }

  refreshRespectiveData(updatedcollectionName){
    this.refs.left.refreshRespectiveData(updatedcollectionName);
  }

  toggleMessage = () => {

  }

  render () {
    Tabs.setUseDefaultStyles(false);
    const hasUserAdminPriv = privilegesAPI.hasPrivilege('viewUser', '',this.props.location.query.db );
    const hasUserAdminAnyDatabasePriv = privilegesAPI.hasPrivilege('viewUser','',this.props.location.query.db );
    const hasDbStatsPriv   = privilegesAPI.hasPrivilege('dbStats' , '' , this.props.location.query.db);

    const hasListColPriv   = privilegesAPI.hasPrivilege('listCollections' , '' , this.props.location.query.db);
    return(
      <div className = {this.props.location.query.collapsed == 'false' ? collectionsStyles.mainContainer+ ' collectionsContainer col-lg-10  col-sm-9 col-xs-8 col-md-9' : collectionsStyles.mainContainer+' collectionsContainer col-lg-11  col-sm-11 col-xs-10 col-md-11 ' +collectionsStyles.collapsedContainer}>
        <button type="button" className="navbar-toggle collapsed" data-toggle="collapse" data-target="#mainNavbar" aria-expanded="false" onClick={this.toggleMessage}><span className={collectionsStyles.collapseSpan}>{this.state.navMessage}</span></button>
        {this.props.location.query.db !== 'undefined' ? 
        
        <Tabs selectedIndex={this.state.selectedTab} onSelect={this.handleSelect}>
          
          <TabList id = "mainNavbar" className={collectionsStyles.tabs + ' nav navbar-nav mainTab collapse navbar-collapse'}>
            <Tab onClick={this.switchTab} className={this.state.selectedTab == 0 ? collectionsStyles.activeTab : '' } ><span data-target=".navbar-collapse.in" data-toggle="collapse">Collections</span></Tab>
            <Tab onClick={this.switchTab} className={this.state.selectedTab == 1 ? collectionsStyles.activeTab : '' }><span data-target=".navbar-collapse.in" data-toggle="collapse">GridFS</span></Tab>
            <Tab onClick={this.switchTab} className={this.state.selectedTab == 2 ? collectionsStyles.activeTab : '' }><span data-target=".navbar-collapse.in" data-toggle="collapse">Users</span></Tab>
            <Tab onClick={this.switchTab} className={this.state.selectedTab == 3 ? collectionsStyles.activeTab : '' }><span data-target=".navbar-collapse.in" data-toggle="collapse">Statistics</span></Tab>
          </TabList>
          
          <TabPanel className ='mainTabPanel'>
            { this.state.hasListColPriv == true ?
              <div className={collectionsStyles.holder + ' row'}>
                <CollectionList ref="left"  visible={true} propps = {this.props} showQueryExecutor = {this.showQueryExecutor} hideQueryExecutor = {this.hideQueryExecutor} selectedDB={this.props.location.query.db} setStates = {this.setStates} refreshDb = {this.props.refreshDb} ></CollectionList>
                {this.state.showQueryExecutor ? <QueryExecutor ref='right' refreshRespectiveData={this.refreshRespectiveData} refreshCollectionList={this.refreshCollectionList} queryType= "collection" currentDb={this.props.location.query.db} currentItem={this.state.selectedCollection} connectionId={this.props.connectionId}></QueryExecutor> : null}
              </div> : ( this.state.hasListColPriv ==null ? <div className={collectionsStyles.loading}><img src={'/images/loading.gif'} ></img><label>Checking for Privileges</label></div>:<div className = {collectionsStyles.errorHolder}>You are not authorised to view Collections</div>)
            }
          </TabPanel>
          <TabPanel className ='mainTabPanel'>
            { hasListColPriv  ?
              <div className={'row'}>
                <GridFSList ref="left"  visible={true} propps = {this.props} selectedDB={this.props.location.query.db} setStates = {this.setStates} refreshDb = {this.props.refreshDb} ></GridFSList>
                {this.state.showQueryExecutor ? <QueryExecutor ref='right' refreshRespectiveData={this.refreshRespectiveData} refreshCollectionList={this.refreshCollectionList} queryType= "fs" currentDb={this.props.location.query.db} currentItem={this.state.selectedCollection} connectionId={this.props.connectionId}></QueryExecutor> : null}
              </div> : <div className = {collectionsStyles.errorHolder}>You are not authorised to view GridFS</div>
            }
          </TabPanel>
          <TabPanel className ='mainTabPanel'>
            { hasUserAdminPriv || hasUserAdminAnyDatabasePriv ? 
              <div className={'row'}>
                <UserList ref="left"  visible={true} propps = {this.props} selectedDB={this.props.location.query.db} setStates = {this.setStates} refreshDb = {this.props.refreshDb} ></UserList>
                {this.state.showQueryExecutor ? <UserDetails ref='right' refreshData={this.refreshRespectiveData} users={this.state.userDetails} currentDb={this.props.location.query.db} currentItem={this.state.selectedCollection} connectionId={this.props.connectionId} refreshCollectionList={this.refreshCollectionList}></UserDetails> : null}
              </div> : <div className = {collectionsStyles.errorHolder}>You are not authorised to view Users</div>}  
          </TabPanel>
          <TabPanel className ='mainTabPanel'>
          { hasDbStatsPriv ?
            <DbStats ref="left"  visible={true} connectionId = {this.props.connectionId} selectedDB={this.props.location.query.db}></DbStats>
            : <div className = {collectionsStyles.errorHolder}>You are not authorised to view DB Statistics</div>
          }
          </TabPanel>
      </Tabs> : null}
      </div>
    );
  }
}

CollectionsComponent.propTypes = {
  location: React.PropTypes.object,
  refreshDb: React.PropTypes.func,
  connectionId: React.PropTypes.string
};

export default CollectionsComponent;
