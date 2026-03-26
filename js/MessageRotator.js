export class MessageRotator {
  constructor(board) {
    this.board = board;
    this._timer = null;
    this._lastMinuteKey = '';
    this.timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Local';
  }

  start() {
    // Show immediately on load
    this._renderTime(true);

    // Check once per second and only update when minute changes
    this._timer = setInterval(() => {
      this._renderTime(false);
    }, 1000);
  }

  stop() {
    if (this._timer) {
      clearInterval(this._timer);
      this._timer = null;
    }
  }

  next() {
    this._renderTime(true);
  }

  prev() {
    this._renderTime(true);
  }

  _renderTime(force) {
    if (!force && this.board.isTransitioning) return;

    const now = new Date();
    const minuteKey = this._getMinuteKey(now);
    if (!force && minuteKey === this._lastMinuteKey) return;

    this.board.displayMessage(this._buildClockLines(now));
    this._lastMinuteKey = minuteKey;
  }

  _getMinuteKey(now) {
    const parts = new Intl.DateTimeFormat('sv-SE', {
      timeZone: this.timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).formatToParts(now);

    const map = {};
    parts.forEach((part) => {
      if (part.type !== 'literal') map[part.type] = part.value;
    });

    return `${map.year}-${map.month}-${map.day}-${map.hour}:${map.minute}`;
  }

  _buildClockLines(now) {
    const timeParts = new Intl.DateTimeFormat(undefined, {
      timeZone: this.timeZone,
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }).formatToParts(now);

    const dateLabel = new Intl.DateTimeFormat(undefined, {
      timeZone: this.timeZone,
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    }).format(now).toUpperCase();

    const hour = timeParts.find((p) => p.type === 'hour')?.value || '';
    const minute = timeParts.find((p) => p.type === 'minute')?.value || '';
    const dayPeriod = (timeParts.find((p) => p.type === 'dayPeriod')?.value || '').toUpperCase();

    const zoneLabel = (this.timeZone || 'LOCAL').replace(/_/g, ' ').toUpperCase();

    return [
      dateLabel,
      '',
      `${hour}:${minute} ${dayPeriod}`.trim(),
      '',
      zoneLabel,
      ''
    ];
  }
}
