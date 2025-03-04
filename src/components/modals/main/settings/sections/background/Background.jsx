import variables from 'modules/variables';
import { PureComponent } from 'react';
import { MenuItem } from '@mui/material';
import { MdSource, MdOutlineKeyboardArrowRight, MdOutlineAutoAwesome } from 'react-icons/md';

import Header from '../../Header';
import Checkbox from '../../Checkbox';
import ChipSelect from '../../ChipSelect';
import Dropdown from '../../Dropdown';
import Slider from '../../Slider';
import Radio from '../../Radio';
import SettingsItem from '../../SettingsItem';
import Text from '../../Text';

import ColourSettings from './Colour';
import CustomSettings from './Custom';

import { values } from 'modules/helpers/settings/modals';

export default class BackgroundSettings extends PureComponent {
  constructor() {
    super();
    this.state = {
      backgroundType: localStorage.getItem('backgroundType') || 'api',
      backgroundFilter: localStorage.getItem('backgroundFilter') || 'none',
      backgroundCategories: [variables.getMessage('modals.main.loading')],
      backgroundAPI: localStorage.getItem('backgroundAPI') || 'mue',
      marketplaceEnabled: localStorage.getItem('photo_packs'),
      effects: false,
      backgroundSettingsSection: false,
    };
    this.controller = new AbortController();
  }

  async getBackgroundCategories() {
    const data = await (
      await fetch(variables.constants.API_URL + '/images/categories', {
        signal: this.controller.signal,
      })
    ).json();

    if (this.controller.signal.aborted === true) {
      return;
    }

    if (this.state.backgroundAPI !== 'mue') {
      // remove counts from unsplash categories
      data.forEach((category) => {
        delete category.count;
      });
    }

    this.setState({
      backgroundCategories: data,
      backgroundCategoriesOG: data,
    });
  }

  updateAPI(e) {
    if (e === 'mue') {
      this.setState({
        backgroundCategories: this.state.backgroundCategoriesOG,
        backgroundAPI: 'mue',
      });
    } else {
      const data = this.state.backgroundCategories;
      data.forEach((category) => {
        delete category.count;
      });

      this.setState({
        backgroundAPI: 'unsplash',
        backgroundCategories: data,
      });
    }
  }

  componentDidMount() {
    if (navigator.onLine === false || localStorage.getItem('offlineMode') === 'true') {
      return this.setState({
        backgroundCategories: [variables.getMessage('modals.update.offline.title')],
      });
    }

    this.getBackgroundCategories();
  }

  componentWillUnmount() {
    // stop making requests
    this.controller.abort();
  }

  render() {
    /* const interval = (
      <SettingsItem
        title={variables.getMessage('modals.main.settings.sections.background.interval.title')}
        subtitle={variables.getMessage(
          'modals.main.settings.sections.background.interval.subtitle',
        )}
        final={
          localStorage.getItem('photo_packs') &&
          this.state.backgroundType !== 'custom' &&
          this.state.backgroundType !== 'colour' &&
          this.state.backgroundType !== 'api'
        }
      >
        <Dropdown
          label={variables.getMessage('modals.main.settings.sections.background.interval.title')}
          name="backgroundchange"
          name2="backgroundStartTime"
          value2={Date.now()}
        >
          <option value="refresh">{variables.getMessage('tabname')}</option>
          <option value="60000">
            {variables.getMessage('modals.main.settings.sections.background.interval.minute')}
          </option>
          <option value="1800000">
            {variables.getMessage('modals.main.settings.sections.background.interval.half_hour')}
          </option>
          <option value="3600000">
            {variables.getMessage('modals.main.settings.sections.background.interval.hour')}
          </option>
          <option value="86400000">
            {variables.getMessage('modals.main.settings.sections.background.interval.day')}
          </option>
          <option value="604800000">{variables.getMessage('widgets.date.week')}</option>
          <option value="2628000000">
            {variables.getMessage('modals.main.settings.sections.background.interval.month')}
          </option>
        </Dropdown>
      </SettingsItem>
    );*/

    const APISettings = (
      <>
        <SettingsItem
          title={variables.getMessage('modals.main.settings.sections.background.api')}
          subtitle={variables.getMessage('modals.main.settings.sections.background.api_subtitle')}
          final={this.state.backgroundAPI === 'mue'}
        >
          {this.state.backgroundCategories[0] === variables.getMessage('modals.main.loading') ? (
            <>
              <Dropdown
                label={variables.getMessage('modals.main.settings.sections.background.category')}
                name="apiCategories"
              >
                <MenuItem value="loading" key="loading">
                  {variables.getMessage('modals.main.loading')}
                </MenuItem>
                <MenuItem value="loading" key="loading">
                  {variables.getMessage('modals.main.loading')}
                </MenuItem>
              </Dropdown>
            </>
          ) : (
            <ChipSelect
              label={variables.getMessage('modals.main.settings.sections.background.categories')}
              options={this.state.backgroundCategories}
              name="apiCategories"
            />
          )}
          <Dropdown
            label={variables.getMessage(
              'modals.main.settings.sections.background.source.quality.title',
            )}
            name="apiQuality"
            element=".other"
          >
            <option value="original">
              {variables.getMessage(
                'modals.main.settings.sections.background.source.quality.original',
              )}
            </option>
            <option value="high">
              {variables.getMessage('modals.main.settings.sections.background.source.quality.high')}
            </option>
            <option value="normal">
              {variables.getMessage(
                'modals.main.settings.sections.background.source.quality.normal',
              )}
            </option>
            <option value="datasaver">
              {variables.getMessage(
                'modals.main.settings.sections.background.source.quality.datasaver',
              )}
            </option>
          </Dropdown>
          <Radio
            title="API"
            options={[
              {
                name: 'Mue',
                value: 'mue',
              },
              {
                name: 'Unsplash',
                value: 'unsplash',
              },
            ]}
            name="backgroundAPI"
            category="background"
            element="#backgroundImage"
            onChange={(e) => this.updateAPI(e)}
          />
        </SettingsItem>
        {this.state.backgroundAPI === 'unsplash' && (
          <SettingsItem
            title="Unsplash Collection(s)"
            subtitle="Select the collection(s) you want to use for your background"
            final={true}
          >
            <Text
              title="Collection ID(s)"
              subtitle="Enter the collection ID(s) you want to use for your background"
              placeholder="e.g. 123456, 654321"
              name="unsplashCollections"
              category="background"
              element="#backgroundImage"
            />
          </SettingsItem>
        )}
      </>
    );

    let backgroundSettings = APISettings;
    switch (this.state.backgroundType) {
      case 'custom':
        backgroundSettings = <CustomSettings />;
        break;
      case 'colour':
        backgroundSettings = <ColourSettings />;
        break;
      case 'random_colour':
      case 'random_gradient':
        backgroundSettings = <></>;
        break;
      default:
        break;
    }

    if (
      localStorage.getItem('photo_packs') &&
      this.state.backgroundType !== 'custom' &&
      this.state.backgroundType !== 'colour' &&
      this.state.backgroundType !== 'api'
    ) {
      backgroundSettings = null;
    }

    const usingImage =
      this.state.backgroundType !== 'colour' &&
      this.state.backgroundType !== 'random_colour' &&
      this.state.backgroundType !== 'random_gradient';

    let header;
    if (this.state.effects === true) {
      header = (
        <span className="mainTitle" onClick={() => this.setState({ effects: false })}>
          <span className="backTitle">
            {variables.getMessage('modals.main.settings.sections.background.title')}
          </span>
          <MdOutlineKeyboardArrowRight />{' '}
          {variables.getMessage('modals.main.settings.sections.background.effects.title')}
        </span>
      );
    } else if (this.state.backgroundSettingsSection === true) {
      header = (
        <span
          className="mainTitle"
          onClick={() => this.setState({ backgroundSettingsSection: false })}
        >
          <span className="backTitle">
            {variables.getMessage('modals.main.settings.sections.background.title')}{' '}
          </span>
          <MdOutlineKeyboardArrowRight />{' '}
          {variables.getMessage('modals.main.settings.sections.background.source.title')}
        </span>
      );
    } else {
      header = (
        <Header
          title={variables.getMessage('modals.main.settings.sections.background.title')}
          setting="background"
          category="background"
          element="#backgroundImage"
        />
      );
    }

    return (
      <>
        {header}
        {this.state.backgroundSettingsSection !== true && this.state.effects !== true ? (
          <>
            <div
              className="moreSettings"
              onClick={() => this.setState({ backgroundSettingsSection: true })}
            >
              <div className="left">
                <MdSource />
                <div className="content">
                  <span className="title">
                    {variables.getMessage('modals.main.settings.sections.background.source.title')}
                  </span>
                  <span className="subtitle">
                    {variables.getMessage(
                      'modals.main.settings.sections.background.source.subtitle',
                    )}
                  </span>
                </div>
              </div>
              <div className="action">
                <Dropdown
                  label={variables.getMessage(
                    'modals.main.settings.sections.background.type.title',
                  )}
                  name="backgroundType"
                  onChange={(value) => this.setState({ backgroundType: value })}
                  category="background"
                >
                  {this.state.marketplaceEnabled && (
                    <option value="photo_pack">
                      {variables.getMessage('modals.main.navbar.marketplace')}
                    </option>
                  )}
                  <option value="api">
                    {variables.getMessage('modals.main.settings.sections.background.type.api')}
                  </option>
                  <option value="custom">
                    {variables.getMessage(
                      'modals.main.settings.sections.background.type.custom_image',
                    )}
                  </option>
                  <option value="colour">
                    {variables.getMessage(
                      'modals.main.settings.sections.background.type.custom_colour',
                    )}
                  </option>
                  <option value="random_colour">
                    {variables.getMessage(
                      'modals.main.settings.sections.background.type.random_colour',
                    )}
                  </option>
                  <option value="random_gradient">
                    {variables.getMessage(
                      'modals.main.settings.sections.background.type.random_gradient',
                    )}
                  </option>
                </Dropdown>
              </div>
            </div>
            {this.state.backgroundType === 'api' ||
            this.state.backgroundType === 'custom' ||
            this.state.marketplaceEnabled ? (
              <>
                <div className="moreSettings" onClick={() => this.setState({ effects: true })}>
                  <div className="left">
                    <MdOutlineAutoAwesome />
                    <div className="content">
                      <span className="title">
                        {variables.getMessage(
                          'modals.main.settings.sections.background.effects.title',
                        )}
                      </span>
                      <span className="subtitle">
                        {variables.getMessage(
                          'modals.main.settings.sections.background.effects.subtitle',
                        )}
                      </span>
                    </div>
                  </div>
                  <div className="action">
                    {' '}
                    <MdOutlineKeyboardArrowRight />
                  </div>
                </div>
              </>
            ) : null}
          </>
        ) : null}
        {this.state.backgroundSettingsSection !== true &&
        this.state.effects !== true &&
        (this.state.backgroundType === 'api' ||
          this.state.backgroundType === 'custom' ||
          this.state.marketplaceEnabled) ? (
          <SettingsItem
            title={variables.getMessage('modals.main.settings.sections.background.display')}
            subtitle={variables.getMessage(
              'modals.main.settings.sections.background.display_subtitle',
            )}
            final={true}
          >
            <Checkbox
              name="ddgProxy"
              text={variables.getMessage(
                'modals.main.settings.sections.background.ddg_image_proxy',
              )}
              element=".other"
              disabled={!usingImage}
            />
            <Checkbox
              name="bgtransition"
              text={variables.getMessage('modals.main.settings.sections.background.transition')}
              element=".other"
              disabled={!usingImage}
            />
            <Checkbox
              name="photoInformation"
              text={variables.getMessage(
                'modals.main.settings.sections.background.photo_information',
              )}
              element=".other"
            />
            <Checkbox
              name="photoMap"
              text={variables.getMessage('modals.main.settings.sections.background.show_map')}
              element=".other"
              disabled={!usingImage}
            />
          </SettingsItem>
        ) : null}
        {this.state.backgroundSettingsSection && (
          <>
            <SettingsItem
              title={variables.getMessage('modals.main.settings.sections.background.source.title')}
              subtitle={variables.getMessage(
                'modals.main.settings.sections.background.source.subtitle',
              )}
              final={
                this.state.backgroundType === 'random_colour' ||
                this.state.backgroundType === 'random_gradient'
              }
            >
              <Dropdown
                label={variables.getMessage('modals.main.settings.sections.background.type.title')}
                name="backgroundType"
                onChange={(value) => this.setState({ backgroundType: value })}
                category="background"
              >
                {this.state.marketplaceEnabled && (
                  <option value="photo_pack">
                    {variables.getMessage('modals.main.navbar.marketplace')}
                  </option>
                )}
                <option value="api">
                  {variables.getMessage('modals.main.settings.sections.background.type.api')}
                </option>
                <option value="custom">
                  {variables.getMessage(
                    'modals.main.settings.sections.background.type.custom_image',
                  )}
                </option>
                <option value="colour">
                  {variables.getMessage(
                    'modals.main.settings.sections.background.type.custom_colour',
                  )}
                </option>
                <option value="random_colour">
                  {variables.getMessage(
                    'modals.main.settings.sections.background.type.random_colour',
                  )}
                </option>
                <option value="random_gradient">
                  {variables.getMessage(
                    'modals.main.settings.sections.background.type.random_gradient',
                  )}
                </option>
              </Dropdown>
            </SettingsItem>
            {/* // todo: ideally refactor all of this file, but we need interval to appear on marketplace too */}
            {/*{this.state.backgroundType === 'api' ||
            this.state.backgroundType === 'custom' ||
            this.state.marketplaceEnabled
              ? interval
                  : null}*/}
            {backgroundSettings}
          </>
        )}
        {(this.state.backgroundType === 'api' ||
          this.state.backgroundType === 'custom' ||
          this.state.marketplaceEnabled) &&
        this.state.effects ? (
          <SettingsItem
            title={variables.getMessage('modals.main.settings.sections.background.effects.title')}
            subtitle={variables.getMessage(
              'modals.main.settings.sections.background.effects.subtitle',
            )}
            final={true}
          >
            <Slider
              title={variables.getMessage('modals.main.settings.sections.background.effects.blur')}
              name="blur"
              min="0"
              max="100"
              default="0"
              display="%"
              marks={values('background')}
              category="background"
              element="#backgroundImage"
            />
            <Slider
              title={variables.getMessage(
                'modals.main.settings.sections.background.effects.brightness',
              )}
              name="brightness"
              min="0"
              max="100"
              default="90"
              display="%"
              marks={values('background')}
              category="background"
              element="#backgroundImage"
            />
            <Dropdown
              label={variables.getMessage(
                'modals.main.settings.sections.background.effects.filters.title',
              )}
              name="backgroundFilter"
              onChange={(value) => this.setState({ backgroundFilter: value })}
              category="background"
              element="#backgroundImage"
            >
              <option value="none">
                {variables.getMessage(
                  'modals.main.settings.sections.appearance.navbar.refresh_options.none',
                )}
              </option>
              <option value="grayscale">
                {variables.getMessage(
                  'modals.main.settings.sections.background.effects.filters.grayscale',
                )}
              </option>
              <option value="sepia">
                {variables.getMessage(
                  'modals.main.settings.sections.background.effects.filters.sepia',
                )}
              </option>
              <option value="invert">
                {variables.getMessage(
                  'modals.main.settings.sections.background.effects.filters.invert',
                )}
              </option>
              <option value="saturate">
                {variables.getMessage(
                  'modals.main.settings.sections.background.effects.filters.saturate',
                )}
              </option>
              <option value="contrast">
                {variables.getMessage(
                  'modals.main.settings.sections.background.effects.filters.contrast',
                )}
              </option>
            </Dropdown>
            {this.state.backgroundFilter !== 'none' && (
              <Slider
                title={variables.getMessage(
                  'modals.main.settings.sections.background.effects.filters.amount',
                )}
                name="backgroundFilterAmount"
                min="0"
                max="100"
                default="0"
                display="%"
                marks={values('background')}
                category="background"
                element="#backgroundImage"
              />
            )}
          </SettingsItem>
        ) : null}
      </>
    );
  }
}
