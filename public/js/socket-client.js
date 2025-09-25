// Connect to Socket.IO server and handle dashboard refresh events
const socket = io();

socket.on('connect', () => {
  console.log('Socket connected:', socket.id);
});

// Simple strategy: server will emit 'refresh' to signal clients to update
// New strategy: server sends full dashboard payload and client patches DOM
socket.on('dashboard:update', (payload) => {
  try {
    // Update summary
    if (payload.summary) {
      const s = payload.summary;
      const totalEl = document.getElementById('summary-total-locations');
      const alertsEl = document.getElementById('summary-active-alerts');
      const avgTempEl = document.getElementById('summary-avg-temp');
      const avgHumEl = document.getElementById('summary-avg-humidity');
      if (totalEl) totalEl.textContent = s.totalLocations;
      if (alertsEl) alertsEl.textContent = s.activeAlerts;
      if (avgTempEl) avgTempEl.textContent = s.avgTemp + '°F';
      if (avgHumEl) avgHumEl.textContent = s.avgHumidity + '%';
    }

    // Update device cards
    if (payload.deviceData) {
      const container = document.getElementById('device-cards');
      if (!container) return;

      const existing = Array.from(container.querySelectorAll('.device-card'));
      const mapExisting = new Map(existing.map(el => [el.getAttribute('data-name'), el]));

      // Add or update cards
      payload.deviceData.forEach(device => {
        const key = device.Name;
        const existingEl = mapExisting.get(key);
        if (existingEl) {
          // update values in-place
          const tempEl = existingEl.querySelector('.temp-el');
          const humEl = existingEl.querySelector('.humidity-el');
          const timeEl = existingEl.querySelector('.time-el');
          const statusEl = existingEl.querySelector('.status-badge-el');
          const blinkEl = existingEl.querySelector('.status-blink-el')
          const locSub = existingEl.querySelector('.location-sub');
          if (tempEl) tempEl.textContent = device.temp + '°F';
          if (humEl) humEl.textContent = device.humidity + '%';
          if (timeEl) timeEl.textContent = device.time;
          if (statusEl) {
            statusEl.textContent = device.status === 'alert' ? 'Alert' : 'Normal';
            statusEl.className = 'status-badge ' + device.status + ' status-badge-el';
            
          }
          if (blinkEl) {
            const statusblink = device.status === 'alert' ? 'alert-blink' : ''
            blinkEl.className = 'card location-card' + statusblink + 'status-blink-el'
          }
          
          if (locSub) locSub.textContent = device.location + ' (' + device.campus + ')';
          mapExisting.delete(key);
        } else {
          // create new card element (simple HTML snippet)
          const col = document.createElement('div');
          col.className = 'col-md-6 mb-4 device-card';
          col.setAttribute('data-name', device.Name);
          col.innerHTML = `
            <div class="card location-card status-blink-el">
              <div class="d-flex justify-content-between align-items-center mb-2">
                <div>
                  <h6 class="location-title"><h6 class="location-title">${device.room}</h6></h6>
                  <small class="text-muted location-sub">${device.location} (${device.campus})</small>
                </div>
                <span class="status-badge ${device.status} status-badge-el">${device.status === 'alert' ? 'Alert' : 'Normal'}</span>
              </div>
              <div class="location-details mb-2">
                <span class="location-type"><td><span class="badge ${device.type === 'MDF' ? 'bg-primary' : 'bg-secondary'}">${device.type}</span></td></span>
              </div>
              <div class="metric-row">
                <div class="metric-icon"><i class="fas fa-thermometer-half"></i></div>
                <span>Temperature</span>
                <span class="metric-value temp-el">${device.temp}°F</span>
              </div>
              <div class="metric-row">
                <div class="metric-icon"><i class="fas fa-tint"></i></div>
                <span>Humidity</span>
                <span class="metric-value humidity-el">${device.humidity}%</span>
              </div>
              <div class="metric-row">
                <div class="metric-icon"><i class="fas fa-clock"></i></div>
                <span>Last Updated</span>
                <span class="metric-value time-el">${device.time}</span>
              </div>
            </div>
          `;
          container.prepend(col);
        }
      });

      // Remove cards not present anymore
      mapExisting.forEach((el, name) => el.remove());
    }
  } catch (err) {
    console.error('Error applying dashboard update', err);
  }
});

// Handle full payload (on connect or fallback)
socket.on('dashboard:full', (payload) => {
  try {
    // reuse same update logic by wrapping into a diff that replaces everything
    // clear container then render all devices
    const container = document.getElementById('device-cards');
    if (container && payload.deviceData) {
      container.innerHTML = '';
      payload.deviceData.forEach(device => {
        const col = document.createElement('div');
        col.className = 'col-md-6 mb-4 device-card';
        col.setAttribute('data-name', device.Name);
        col.innerHTML = `
          <div class="card location-card ${device.status === 'alert' ? 'alert-blink' : ''}">
            <div class="d-flex justify-content-between align-items-center mb-2">
              <div>
                <h6 class="location-title"><h6 class="location-title">${device.room}</h6></h6>
                <small class="text-muted location-sub">${device.location} (${device.campus})</small>
              </div>
              <span class="status-badge ${device.status} status-badge-el">${device.status === 'alert' ? 'Alert' : 'Normal'}</span>
            </div>
            <div class="location-details mb-2">
              <span class="location-type"><td><span class="badge ${device.type === 'MDF' ? 'bg-primary' : 'bg-secondary'}">${device.type}</span></td></span>
            </div>
            <div class="metric-row">
              <div class="metric-icon"><i class="fas fa-thermometer-half"></i></div>
              <span>Temperature</span>
              <span class="metric-value temp-el">${device.temp}°F</span>
            </div>
            <div class="metric-row">
              <div class="metric-icon"><i class="fas fa-tint"></i></div>
              <span>Humidity</span>
              <span class="metric-value humidity-el">${device.humidity}%</span>
            </div>
            <div class="metric-row">
              <div class="metric-icon"><i class="fas fa-clock"></i></div>
              <span>Last Updated</span>
              <span class="metric-value time-el">${device.time}</span>
            </div>
          </div>
        `;
        container.appendChild(col);
      });
    }

    // update summary
    if (payload.summary) {
      if (document.getElementById('summary-total-locations')) document.getElementById('summary-total-locations').textContent = payload.summary.totalLocations;
      if (document.getElementById('summary-active-alerts')) document.getElementById('summary-active-alerts').textContent = payload.summary.activeAlerts;
      if (document.getElementById('summary-avg-temp')) document.getElementById('summary-avg-temp').textContent = payload.summary.avgTemp + '°F';
      if (document.getElementById('summary-avg-humidity')) document.getElementById('summary-avg-humidity').textContent = payload.summary.avgHumidity + '%';
    }
  } catch (err) {
    console.error('Error applying full dashboard payload', err);
  }
});

// Apply incremental diffs: { added, updated, removed, summary }
socket.on('dashboard:diff', (diff) => {
  try {
    // apply summary changes
    if (diff.summary) {
      if ('totalLocations' in diff.summary && document.getElementById('summary-total-locations')) document.getElementById('summary-total-locations').textContent = diff.summary.totalLocations;
      if ('activeAlerts' in diff.summary && document.getElementById('summary-active-alerts')) document.getElementById('summary-active-alerts').textContent = diff.summary.activeAlerts;
      if ('avgTemp' in diff.summary && document.getElementById('summary-avg-temp')) document.getElementById('summary-avg-temp').textContent = diff.summary.avgTemp + '°F';
      if ('avgHumidity' in diff.summary && document.getElementById('summary-avg-humidity')) document.getElementById('summary-avg-humidity').textContent = diff.summary.avgHumidity + '%';
    }

    const container = document.getElementById('device-cards');
    if (!container) return;

    // removed
    if (diff.removed && diff.removed.length) {
      diff.removed.forEach(name => {
        const el = container.querySelector(`.device-card[data-name="${name}"]`);
        if (el) el.remove();
      });
    }

    // updated
    if (diff.updated && diff.updated.length) {
      diff.updated.forEach(device => {
        const el = container.querySelector(`.device-card[data-name="${device.Name}"]`);
        if (!el) return;
        const tempEl = el.querySelector('.temp-el');
        const humEl = el.querySelector('.humidity-el');
        const timeEl = el.querySelector('.time-el');
        const statusEl = el.querySelector('.status-badge-el');
        const blinkEl = el.querySelector('.status-blink-el')
        const locSub = el.querySelector('.location-sub');
        if (tempEl) tempEl.textContent = device.temp + '°F';
        if (humEl) humEl.textContent = device.humidity + '%';
        if (timeEl) timeEl.textContent = device.time;
        if (statusEl) {
          statusEl.textContent = device.status === 'alert' ? 'Alert' : 'Normal';
          statusEl.className = 'status-badge ' + device.status + ' status-badge-el';
        }
        if (blinkEl) {
            const statusblink = device.status === 'alert' ? 'alert-blink' : ''
            blinkEl.className = 'card location-card' + statusblink + 'status-blink-el'
          }
        if (locSub) locSub.textContent = device.location + ' (' + device.campus + ')';
      });
    }

    // added
    if (diff.added && diff.added.length) {
      diff.added.forEach(device => {
        const col = document.createElement('div');
        col.className = 'col-md-6 mb-4 device-card';
        col.setAttribute('data-name', device.Name);
        col.innerHTML = `
          <div class="card location-card ${device.status === 'alert' ? 'alert-blink' : ''}">
            <div class="d-flex justify-content-between align-items-center mb-2">
              <div>
                <h6 class="location-title"><h6 class="location-title">${device.room}</h6></h6>
                <small class="text-muted location-sub">${device.location} (${device.campus})</small>
              </div>
              <span class="status-badge ${device.status} status-badge-el">${device.status === 'alert' ? 'Alert' : 'Normal'}</span>
            </div>
            <div class="location-details mb-2">
              <span class="location-type"><td><span class="badge ${device.type === 'MDF' ? 'bg-primary' : 'bg-secondary'}">${device.type}</span></td></span>
            </div>
            <div class="metric-row">
              <div class="metric-icon"><i class="fas fa-thermometer-half"></i></div>
              <span>Temperature</span>
              <span class="metric-value temp-el">${device.temp}°F</span>
            </div>
            <div class="metric-row">
              <div class="metric-icon"><i class="fas fa-tint"></i></div>
              <span>Humidity</span>
              <span class="metric-value humidity-el">${device.humidity}%</span>
            </div>
            <div class="metric-row">
              <div class="metric-icon"><i class="fas fa-clock"></i></div>
              <span>Last Updated</span>
              <span class="metric-value time-el">${device.time}</span>
            </div>
          </div>
        `;
        container.prepend(col);
      });
    }
  } catch (err) {
    console.error('Error applying dashboard diff', err);
  }
});

socket.on('disconnect', () => {
  console.log('Socket disconnected');
});

// Connection status indicator
function ensureConnIndicator(commitMessage) {
  let el = document.getElementById('socket-status');
  if (!el) {
    el = document.createElement('div');
    el.id = 'socket-status';
    el.style.position = 'fixed';
    el.style.bottom = '10px';
    el.style.right = '10px';
    el.style.padding = '6px 10px 6px 14px';
    el.style.borderRadius = '6px';
    el.style.zIndex = 2000;
    el.style.fontSize = '0.9rem';
    el.style.display = 'flex';
    el.style.alignItems = 'center';
    // Status text span
    const statusSpan = document.createElement('span');
    statusSpan.id = 'socket-status-text';
    el.appendChild(statusSpan);
    // Info icon
    const info = document.createElement('span');
    info.id = 'socket-status-info';
    info.className = 'fa-solid fa-circle-info';
    info.style.marginLeft = '6px';
    info.style.cursor = 'pointer';
    info.title = commitMessage || 'No commit message';
    el.appendChild(info);
    document.body.appendChild(el);
  } else {
    // Update tooltip if commit message changed
    const info = document.getElementById('socket-status-info');
    if (info) info.title = commitMessage || 'No commit message';
  }
  return el;
}

function setStatus(connected, commitMessage) {
  const el = ensureConnIndicator(commitMessage);
  const statusSpan = document.getElementById('socket-status-text');
  if (statusSpan) {
    statusSpan.textContent = connected ? 'Live' : 'Disconnected';
  }
  el.style.background = connected ? 'rgba(40,167,69,0.9)' : 'rgba(220,53,69,0.9)';
  el.style.color = 'white';
}

function setReconnecting(commitMessage) {
  const el = ensureConnIndicator(commitMessage);
  const statusSpan = document.getElementById('socket-status-text');
  if (statusSpan) {
    statusSpan.textContent = 'Reconnecting...';
  }
  el.style.background = 'rgba(255,193,7,0.9)';
  el.style.color = 'white';
}

// Example usage: pass the commit message variable
const commitMessage = "Fix: show tooltip with commit message";

socket.on('connect', () => setStatus(true, commitMessage));
socket.on('disconnect', () => setStatus(false, commitMessage));
socket.io.on('reconnect_attempt', () => setReconnecting(commitMessage));