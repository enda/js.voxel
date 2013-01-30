var VOXEL=VOXEL||Object.create(null);VOXEL.Emitter=function(){var e=function(e,t,n,i){if(!e[t])throw Error('Invalid event "'+t+'"');return e[t].push([n,i||this,!1]),this},t=function(e,t,n,i){if(!e[t])throw Error('Invalid event "'+t+'"');return e[t]=e[t].filter(function(e){return e[0]!==n||e[1]!==i}),this},n=function(e,t,n,i){if(!e[t])throw Error('Invalid event "'+t+'"');return e[t].push([n,i||this,!0]),this},i=function(e,t){if(!e[t])return this;var n=Array.prototype.slice.call(arguments,2);return e[t]=e[t].filter(function(e){return e[0].apply(e[1],n),e[2]===!1}),this};return function(r){var s=Object.create(null);return r.on=e.bind(r,s),r.off=t.bind(r,s),r.once=n.bind(r,s),r.trigger=i.bind(r,s),{addEventType:function(e){return s[e]=[],this}}}}();var VOXEL=VOXEL||Object.create(null);VOXEL.Engine=function(){var e=function(e){return[Math.floor(e[0]/16),Math.floor(e[1]/16),Math.floor(e[2]/16)]},t=function(e,t){return[e[0]-t[0],e[1]-t[1],e[2]-t[2]]},n=function(){VOXEL.Emitter(this).addEventType("regionFetched").addEventType("regionMissing").addEventType("regionPolygonized"),this.regions=Object.create(null),this.scheduler=new VOXEL.Scheduler(4)};return n.prototype.fetch=function(e,t){var n=function(n){this.regions[e]=n,n&&this.trigger("regionFetched",new VOXEL.Engine.RegionFetchedEvent(e,n)),t(n)}.bind(this);if(this.regions[e]===void 0){var i=new VOXEL.Engine.RegionMissingEvent(e);this.trigger("regionMissing",i,n),i.isDefaultPrevented()||t(null)}else t(this.regions[e]);return this},n.prototype.get=function(n,i){var r=e(n),s=t(n,r);return this.fetch(r,function(e){null===e?i(null):e.get(s,i)}.bind(this)),this},n.prototype.set=function(n,i,r){var s=function(e,t,n,r){n=n||function(){},(this.regions[e]||r)&&this.fetch(e,function(e){null===e?n(!1):e.set(t,i,function(){n(!0)})})}.bind(this),o=function(e,t,n){e&&0!==h[0]||t&&0!==h[1]||n&&0!==h[2]||s([u[0]-e,u[1]-t,u[2]-n],[e?16:h[0],t?16:h[1],n?16:h[2]],null,!1)},u=e(n),h=t(n,u);return o(1,0,0),o(0,1,0),o(0,0,1),o(1,1,0),o(0,1,1),o(1,0,1),o(1,1,1),s(u,h,r,!0),this},n.RegionMissingEvent=function(e){var t=!1;this.preventDefault=function(){t=!0},this.isDefaultPrevented=function(){return t},this.regionKey=e},n.RegionFetchedEvent=function(e,t){this.regionKey=e,this.region=t},n}();var VOXEL=VOXEL||Object.create(null);VOXEL.Region=function(){var e=function(e){return 17*17*e[2]+17*e[1]+e[0]},t=function(){this.pendingRead=[],this.pendingWrite={},this.dataless=!1,this.buffer=new ArrayBuffer(19652),this.synchronize()};return t.prototype.synchronize=function(){var e=this.data=new Uint32Array(this.buffer),t=this.pendingWrite;this.pendingWrite={},Object.keys(t).forEach(function(n){e[n]=t[n]});var n=this.pendingRead;return this.pendingRead={},Object.keys(n).forEach(function(t){n[t].forEach(function(n){n(e[t])})}),Object.keys(t).length>0},t.prototype.get=function(t,n){var i=e(t);this.dataless?this.pendingWrite[i]?n(this.pendingWrite[i]):(this.pendingRead[i]||(this.pendingRead[i]=[]),this.pendingRead[i].push(n)):n(this.data[i])},t.prototype.set=function(t,n,i){var r=e(t);this.dataless?this.pendingWrite[r]=n:this.data[r]=n,i()},t}(),VOXEL.Region.Task=function(){var e=function(e){this.region=e};return e.prototype.launch=function(){this.region.dataless=!0,this.region.buffer=null},e.prototype.complete=function(e){this.region.buffer=e.buffer,this.region.dataless=!1,this.oncomplete()},this}();var VOXEL=VOXEL||Object.create(null);VOXEL.Scheduler=function(e,t){this.tasks=[],this.callback=t,this.workers=Object.create(null),this.availableWorkers=[];for(var n=0;e>n;++n)this.workers[n]={instance:VOXEL.Scheduler.createWorker(),task:null},this.workers[n].instance.onmessage=this.listener.bind(this,n,null),this.workers[n].instance.onerror=this.listener.bind(this,n),this.availableWorkers.push(n)},VOXEL.Scheduler.createWorker=function(){var e=new Blob([VOXEL.Scheduler.workerScript]),t=(window.URL||window.webkitURL).createObjectURL(e);return function(){return new Worker(t)}}(),VOXEL.Scheduler.prototype.listener=function(e,t,n){if(t)throw t;this["_"+n.command](e,n)},VOXEL.Scheduler.prototype.queue=function(e){this.tasks.push(e),this.dequeue()},VOXEL.Scheduler.prototype.dequeue=function(){if(this.queue.length&&this.availableWorkers.length){var e=this.queue.shift(),t=this.availableWorkers.shift(),n=this.workers[t];n.task=e,n.instance.postMessage(e.data,e.transfers),e.launch()}},VOXEL.Scheduler.prototype._complete=function(e,t){var n=this.workers[e].task;this.workers[e].task=null,this.availableWorkers.push(e),n.complete(t),this.callback(n,t),this.dequeue()},VOXEL.Scheduler.prototype._log=function(e,t){console.log.apply(console,["Worker #"+e].concat(t.parameters))};VOXEL.Scheduler.workerScript="";