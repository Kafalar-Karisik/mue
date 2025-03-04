import variables from 'modules/variables';
import { PureComponent } from 'react';
import Modal from 'react-modal';

import Main from './main/Main';
import Navbar from '../widgets/navbar/Navbar';
import Preview from '../helpers/preview/Preview';

import EventBus from 'modules/helpers/eventbus';

import Welcome from './welcome/Welcome';

import Apps from './apps/Apps';

export default class Modals extends PureComponent {
  constructor() {
    super();
    this.state = {
      mainModal: false,
      updateModal: false,
      welcomeModal: false,
      appsModal: false,
      preview: false,
    };
  }

  componentDidMount() {
    if (
      localStorage.getItem('showWelcome') === 'true' &&
      window.location.search !== '?nointro=true'
    ) {
      this.setState({
        welcomeModal: true,
      });
      variables.stats.postEvent('modal', 'Opened welcome');
    }

    if (window.location.search === '?nointro=true') {
      if (localStorage.getItem('showWelcome') === 'true') {
        localStorage.setItem('showWelcome', false);
        EventBus.emit('refresh', 'widgets');
        EventBus.emit('refresh', 'backgroundwelcome');
      }
    }

    // hide refresh reminder once the user has refreshed the page
    localStorage.setItem('showReminder', false);
  }

  closeWelcome() {
    localStorage.setItem('showWelcome', false);
    this.setState({
      welcomeModal: false,
    });
    EventBus.emit('refresh', 'widgetsWelcomeDone');
    EventBus.emit('refresh', 'widgets');
    EventBus.emit('refresh', 'backgroundwelcome');
  }

  previewWelcome() {
    localStorage.setItem('showWelcome', false);
    localStorage.setItem('welcomePreview', true);
    this.setState({
      welcomeModal: false,
      preview: true,
    });
    EventBus.emit('refresh', 'widgetsWelcome');
  }

  toggleModal(type, action) {
    this.setState({
      [type]: action,
    });

    if (action !== false) {
      variables.stats.postEvent('modal', `Opened ${type.replace('Modal', '')}`);
    }
  }

  render() {
    const navZoom = localStorage.getItem('zoomNavbar');
    const appsInfo = JSON.parse(localStorage.getItem('applinks'));

    return (
      <>
        {this.state.welcomeModal === false && (
          <Navbar openModal={(modal) => this.toggleModal(modal, true)} />
        )}
        <Modal
          closeTimeoutMS={300}
          id="modal"
          onRequestClose={() => this.toggleModal('mainModal', false)}
          isOpen={this.state.mainModal}
          className="Modal mainModal"
          overlayClassName="Overlay"
          ariaHideApp={false}
        >
          <Main modalClose={() => this.toggleModal('mainModal', false)} />
        </Modal>
        <Modal
          closeTimeoutMS={300}
          onRequestClose={() => this.closeWelcome()}
          isOpen={this.state.welcomeModal}
          className="Modal welcomemodal mainModal"
          overlayClassName="Overlay mainModal"
          shouldCloseOnOverlayClick={false}
          ariaHideApp={false}
        >
          <Welcome modalClose={() => this.closeWelcome()} modalSkip={() => this.previewWelcome()} />
        </Modal>

        <Modal
          closeTimeoutMS={300}
          onRequestClose={() => this.toggleModal('appsModal', false)}
          isOpen={this.state.appsModal}
          className="Modal appsmodal"
          overlayClassName="Overlay"
          shouldCloseOnOverlayClick={true}
          ariaHideApp={false}
          style={{
            content: {
              position: 'absolute',
              right: '1rem',
              top: `calc(1rem + ${55 + Math.ceil((navZoom / 20) * (navZoom * 0.01))}px)`,
              overflow: 'visible',
            },
          }}
        >
          <Apps appsInfo={appsInfo} />
        </Modal>

        {this.state.preview && <Preview setup={() => window.location.reload()} />}
      </>
    );
  }
}
