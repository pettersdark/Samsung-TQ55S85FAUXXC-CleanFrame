import assert from 'node:assert/strict';
import { mkdirSync } from 'node:fs';
import { openPreview, root } from './browser.mjs';
const preview = await openPreview({ publicFonts: true });
const out = root + '.local/qa/live-programs/';mkdirSync(out, { recursive: true });
try {
  for (const [width, height] of [[1920,1080],[1280,720]]) {
    const p = await preview.browser.newPage({ viewport:{width,height} }), errors=[];
    p.on('pageerror', e => errors.push(e.message));
    await p.goto(preview.baseURL+'/home/');await p.waitForFunction(()=>ShoreQA.ready());
    await p.evaluate(()=>{
      window.testTunes=[];window.testFull=0;
      FrameDevice.previewTV=(r,done)=>done(null);FrameDevice.hidePreview=done=>{if(done)done(null)};
      FrameDevice.liveTV=done=>{window.testFull++;done(null)};
      FrameDevice.channels=done=>done(null,Array.from({length:80},(_,i)=>({major:i+1,channelName:'Canal '+(i+1)})));
      FrameDevice.tuneChannel=(ch,done)=>{window.testTunes.push(ch.major);done(null)};
      FrameDevice.programs=(ch,done)=>{
        if(window.delayEPG){window.lateEPG=done;return;}
        const now=Date.now();done(null,ch&&ch.major===2?{current:null,next:null}:{current:{title:'Programa de prueba con un título bastante largo para verificar el espacio',description:'Una descripción larga que se puede leer con el mando. '.repeat(55),start:now-600000,end:now+1800000},next:{title:'El siguiente programa',start:now+1800000}});
      };
    });
    await p.locator('[data-action="util.live"]').click();
    await p.waitForFunction(()=>document.getElementById('liveTVProgramTitle').textContent.indexOf('Programa de prueba')===0);
    const geometry=await p.evaluate(()=>{
      const rect=s=>{const r=document.querySelector(s).getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height,bottom:r.bottom,right:r.right}};
      return {list:rect('.live-tv-sidebar'),video:rect('#liveTVFrame'),footer:rect('.live-tv-footer'),info:rect('.live-tv-program'),hint:rect('.live-tv-hint'),description:rect('#liveTVDescription')};
    });
    assert.ok(Math.abs(geometry.video.width/geometry.video.height-16/9)<.01);
    assert.ok(geometry.list.right<geometry.video.x);
    assert.ok(geometry.video.bottom<=geometry.footer.y);
    assert.ok(geometry.footer.bottom<=geometry.info.y);
    assert.ok(geometry.info.bottom<geometry.hint.y,JSON.stringify(geometry));
    assert.ok(await p.locator('#liveTVDescription').evaluate(el=>el.clientHeight>=parseFloat(getComputedStyle(el).lineHeight)*3));
    await p.screenshot({path:out+width+'-programme.png'});
    await p.locator('#liveTVFullscreen').focus();await p.keyboard.press('ArrowDown');
    assert.equal(await p.evaluate(()=>document.activeElement.id),'liveTVDescription');
    await p.keyboard.press('ArrowDown');assert.ok(await p.locator('#liveTVDescription').evaluate(el=>el.scrollTop)>0);
    await p.locator('.live-tv-channel').nth(1).focus();
    await p.waitForFunction(()=>document.getElementById('liveTVProgramTitle').textContent==='Información no disponible');
    assert.equal(await p.evaluate(()=>window.testFull),0);
    await p.screenshot({path:out+width+'-empty.png'});
    const tunesBeforeGuide=await p.evaluate(()=>window.testTunes.length);
    await p.evaluate(()=>{
      window.oldPrograms=FrameDevice.programs;
      FrameDevice.programs=(ch,done,options)=>{
        if(!options){window.oldPrograms(ch,done);return;}
        const start=options.start;
        done(null,{schedule:ch.major===2?[]:[
          {title:'Noticias del día',description:'Primera descripción. '.repeat(50),start:start-600000,end:start+1800000},
          {title:'Cine de tarde',description:'Una película y su sinopsis. '.repeat(30),start:start+1800000,end:start+7200000},
          {title:'Documental',description:'Último programa',start:start+7200000,end:start+10800000}]});
      };
    });
    await p.locator('#liveTVGuide').click();await p.waitForFunction(()=>FrameGuide.isOpen());
    await p.locator('.guide-programme').first().focus();await p.keyboard.press('ArrowRight');
    assert.equal(await p.locator('#guideTitle').textContent(),'Cine de tarde');
    await p.keyboard.press('ArrowDown');assert.equal(await p.locator('#guideTitle').textContent(),'Canal 2');
    await p.locator('#guideLater').click();assert.ok((await p.locator('#guideDate').textContent()).includes('–'));
    await p.locator('#guideDown').click();assert.match(await p.locator('#guidePage').textContent(),/^7–12/);
    const guideGeometry=await p.evaluate(()=>{
      const r=s=>document.querySelector(s).getBoundingClientRect();
      return {rowsBottom:r('.guide-rows').bottom,pagesTop:r('.guide-pages').top,detailsTop:r('.guide-details').top,detailsBottom:r('.guide-details').bottom,hintTop:r('.guide-hint').top,
        lines:document.getElementById('guideDescription').clientHeight/parseFloat(getComputedStyle(document.getElementById('guideDescription')).lineHeight)};
    });
    assert.ok(guideGeometry.rowsBottom<guideGeometry.pagesTop);assert.ok(guideGeometry.detailsBottom<guideGeometry.hintTop,JSON.stringify(guideGeometry));assert.ok(guideGeometry.lines>=3);
    await p.screenshot({path:out+width+'-guide.png'});
    await p.locator('#liveTVDialog').evaluate(el=>el.classList.remove('is-day'));
    await p.waitForTimeout(200);
    assert.equal(await p.locator('.guide-programme').first().evaluate(el=>getComputedStyle(el).backgroundColor), 'rgba(174, 188, 207, 0.23)');
    await p.screenshot({path:out+width+'-guide-night.png'});
    await p.locator('#liveTVDialog').evaluate(el=>el.classList.add('is-day'));
    assert.equal(await p.evaluate(()=>window.testTunes.length),tunesBeforeGuide);
    await p.keyboard.press('Escape');assert.equal(await p.evaluate(()=>FrameGuide.isOpen()),false);
    await p.evaluate(()=>{FrameDevice.programs=window.oldPrograms});
    await p.locator('.live-tv-channel').nth(2).click();await p.waitForFunction(()=>window.testFull===1);
    assert.equal(await p.locator('#liveTVDialog').evaluate(el=>el.hidden),true);
    // A closed/superseded request must never update the next dialog session.
    await p.evaluate(()=>{window.delayEPG=true});await p.locator('[data-action="util.live"]').click();
    await p.waitForFunction(()=>typeof window.lateEPG==='function');
    await p.keyboard.press('Escape');await p.evaluate(()=>{window.lateEPG(null,{current:{title:'Stale',start:0,end:1,description:'stale'}})});
    assert.notEqual(await p.locator('#liveTVProgramTitle').textContent(),'Stale');
    await p.evaluate(()=>{window.delayEPG=false;FrameDevice.channels=done=>done(null,[])});
    await p.locator('[data-action="util.live"]').click();await p.locator('#liveTVGuide').click();
    assert.equal(await p.evaluate(()=>FrameGuide.isOpen()),false);
    assert.match(await p.locator('#liveTVStatus').textContent(),/No hay canales disponibles/);
    assert.match(await p.locator('#liveTVListStatus').textContent(),/No se han recibido canales/);
    await p.keyboard.press('Escape');
    assert.deepEqual(errors,[]);await p.close();
  }
  console.log('PASS: EPG layout at 1080p/720p, long-description remote scrolling, empty metadata, preview vs OK fullscreen, late callback cancellation.');
} finally { await preview.close(); }
