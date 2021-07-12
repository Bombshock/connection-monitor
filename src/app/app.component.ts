import { Component } from '@angular/core';

@Component( {
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: [ './app.component.scss' ]
} )
export class AppComponent {

  public opened = false;
  public notifications = false;
  public history: { date: string, duration: number }[] = [];

  private websocket;
  private lastDisconnect;

  constructor() {
    this.loadHistory();
    this.connect();
    this.notifications = this.getNotificationPermission();
  }

  public turnOnNotificatiuons() {
    Notification.requestPermission().then( () => {
      this.notifications = this.getNotificationPermission();
    } );
  }

  public getNotificationPermission() {
    return Notification.permission !== 'denied' && Notification.permission !== 'default' && localStorage.notifications !== 'off';
  }

  public changeNotificationToggle( $event ) {
    localStorage.notifications = $event.checked ? 'on' : 'off';
    this.notifications = this.getNotificationPermission();
  }

  private connect() {
    this.websocket = new WebSocket( 'wss://echo.websocket.org' );
    this.websocket.onopen = () => this.onOpen();
    this.websocket.onclose = () => this.onClose();
    this.websocket.onmessage = ( ...args ) => console.log( args );
    this.websocket.onerror = ( ...args ) => console.log( args );
  }

  private onOpen() {
    this.opened = true;
    if ( this.lastDisconnect ) {
      this.history.unshift( {
        date: ( new Date( this.lastDisconnect ) ).toString(),
        duration: Date.now() - this.lastDisconnect
      } );
      this.lastDisconnect = undefined;
      this.saveHistory();
    }
  }

  private onClose() {
    this.opened = false;
    if ( !this.lastDisconnect ) {
      this.lastDisconnect = Date.now();
      if ( this.notifications ) {
        new Notification( 'Disconnected' );
      }
    }
    setTimeout( () => {
      this.connect();
    }, 1000 );
  }

  private saveHistory() {
    localStorage.history = JSON.stringify( this.history, null, 0 );
  }

  private loadHistory() {
    if ( localStorage.history ) {
      this.history = JSON.parse( localStorage.history );
    }
  }
}
