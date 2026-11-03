> Current wallpaper packages and single-line clock: [behavior and validation](wallpaper-packs.md). Historical gallery counts below are superseded.

# Interaction behaviour — 0.7.0

## Home

- Dock: Left/Right scrolls the apps without wrapping. Up enters the top-right controls, starting with Art Mode or the last selected control. Left/Right moves between Art Mode, All apps and Settings. Down or Back returns to the selected app. The clock is at the top left.
- List: Up/Down scrolls the apps without wrapping. Right enters the bottom-right controls, aligned with the clock above. Up/Down moves between Art Mode, All apps and Settings. Left or Back returns to the selected app. The list fades at both ends as it scrolls.
- OK opens the selected item. Focus alone never launches an app.
- Icons-only apps and controls reveal their names when focused. App presentation and control presentation are independent.
- Back from the app list or Dock opens a choice to stay or open Samsung Home.
- A panel keeps focus within its own controls. Back closes one panel at a time.
- Returning to the running launcher keeps the selected app or panel item. There is no auto-return timer. Held OK and Back keys act once until the key is released.

## Settings and appearance

Settings opens a grouped overview: Background, Layout, Typography, Focus, Apps on Home and Samsung. OK opens a group. Appearance groups use a two-pane screen with visible choices on the left and the committed Home preview on the right.

| Group | Choices |
| --- | --- |
| Background | Photo, Light, Dark; Wallpaper and Rotation when Photo is active |
| Layout | List or Dock; independent Text, Icons or Both choices for apps and Home controls |
| Typography | Manrope, Neue Montreal, Mori, Pangram Sans, Geist and Newsreader, when available |
| Focus | Type or Glass; Soft, Frost or Clear tint material |
| Apps on Home | Membership and arrangement editor |
| Samsung | Samsung Home, TV settings and Inputs |

Up/Down moves between rows. Left/Right moves between choices in a horizontal row. Focus alone changes neither the preview nor saved preferences in these appearance groups. Wallpaper has its own temporary photo preview, described below. OK applies the focused value. A checkmark identifies the applied value; the filled plate identifies remote focus. Applying the current value does not write again.

Material applies to a photographic Dock, or Glass focus on a photographic List. Inactive material choices remain visible with an explanation and are skipped during navigation. Their stored value is retained. Wallpaper and rotation are also inactive on flat backgrounds.

A font or photo change applies only after its resources are ready and storage succeeds. A load or storage failure keeps the previous appearance and checkmark, with a Try again action. Back cancels a pending change, leaves the group and keeps completed changes. Late load callbacks cannot apply a cancelled choice. There is no Save button. Returning to a group restores its last choice focus; returning to Settings restores its category focus. Rotation is nested within Background, and Back returns to its Rotation row.

The selected font applies to Home app names, the clock and Home controls, including Newsreader. Settings, All apps, the Home editor and status text retain Manrope. The preview shows the committed Home appearance and its clock continues to update. Pangram faces are available in Nathan's private build when the local files are present; their binaries are not included in the public source. An unavailable optional face is omitted. If the baseline font is slow or missing, Home remains usable with a local fallback and can recover when the font loads.

## Streaming apps

The nine default apps keep their known native IDs. Other installed consumer apps can also be added to Home. Launching uses the public `tizen.application.launch` API with the app's native ID. Missing apps and denied launches produce a real error. No web player, placeholder success page or account credential is embedded.

## All apps

The panel reads `tizen.application.getAppsInfo` on entry and shows the filtered consumer apps alphabetically. Samsung's visibility flag alone also exposes system utilities, so EP packages, background services, ad players, account utilities, placeholders and duplicates are omitted. Known brands use bundled marks. Other apps use their local installed icon, with initials as a fallback.

The five-column grid scrolls with remote focus. OK launches an app; its On Home badge shows membership. Up from the first row reaches Apps on Home, which opens the editor. An API failure shows a retry and keeps saved Home choices. Browser previews report that installed-app discovery and launching require the TV.

## Apps on Home

Open the editor from Settings or All apps. On Home shows the current order on the left. Not on Home shows Recently removed first, followed by other installed apps on the right. Home holds one to nine apps.

- Reorder: OK on an app name picks it up. Up/Down moves it. OK places it and saves the order. Back puts an unplaced app back without saving that move.
- Remove: Right from an app name reaches Remove from Home. OK saves the removal and moves focus to the same app in Recently removed. The app stays installed.
- Add: OK on an app in Not on Home adds it and saves. A recently removed app returns to its previous position within the editing session; another app is added at the end. Focus follows the app to its name, so OK can start reordering the newly added shortcut.
- Undo reverses a completed addition, removal or reorder from the current editing session. Done or Back closes the editor and keeps completed changes. Undo history ends when the editor closes.

Removing the last Home app or adding a tenth app is prevented. A failed storage write keeps the committed choices and order, with a retry message. Saved native app IDs and names survive a restart or a failed catalogue refresh.

## Art Mode and Samsung screens

Art Mode sends an application control to the installed `org.tizen.art-app`, with `mode=fullscreen` and `requester=mobile`. This aims to enter native Art Mode with its current artwork, without toggling power or changing the selected artwork.

This mode comes from [research on Samsung's Art app](https://github.com/TheFab21/ha-samsungtv-smart/blob/master/notes/QN55LS03FAFXZA/ART_MODE_DECOMPILED.md), on another Tizen 9 Frame model. It is an internal Samsung contract, not a documented public Art API. Its visible behaviour on this exact firmware must be confirmed on the TV.

Samsung Home explicitly launches the original `com.samsung.tv.csfs` app, independently of the new Home assignment. The earlier `com.samsung.tv.coba.newhome` component did not open Smart Hub visibly and is no longer the escape target. TV settings still uses `com.samsung.tv.coba.setting`. Exact on-device destinations are recorded in docs/tv-status.md; launch callbacks alone are not visual proof. There is no blind power-key fallback.

All calls have bounded response handling. A failure leaves CleanFrame usable. No simulated device success views remain. Browser validation cannot confirm the visible Samsung destination.

Installed-app discovery allows up to 20 seconds for large TV catalogues; launch controls retain an 8-second limit. Opening All apps or the editor refreshes the catalogue while retaining saved Home choices. No discovery polling runs during hidden startup.

## HDMI inputs

Settings → Samsung → Inputs opens the HDMI chooser. The adapter reads the TV’s actual connected and disconnected source records, including sleeping devices that may be listed as disconnected. It does not guess a universal port count or add a fourth default Home control. Missing APIs, denied access and discovery failure produce an unavailable/error state rather than invented ports. The active source comes from the synchronous `tvwindow.getSource()` return value.

Up/Down selects an input. OK requests that exact source; Back returns to Samsung Settings. Retry after a failed load rereads the available sources. A routing error remains an error, and a failed handoff leaves the launcher usable. Timed-out or cancelled requests cannot start a later routing or viewer action; a native request already sent to the TV may itself be uncancellable.

Selecting a source, opening Samsung’s viewer, seeing the expected HDMI picture and waking a CEC device are separate results. The portable implementation does not import firmware-specific viewer payloads or claim to wake a sleeping device. No input discovery or polling runs during hidden startup.

## Preferences and wallpaper

The launcher stores appearance, Home order, recently removed apps, the last launched Home app, wallpaper and rotation locally. List and Dock share these preferences. The existing `cleanframe.home.v1` key is retained, with a fallback read from `cleanframe.shore.v1`. Legacy List maps to Dark + List + Type; Glass Dock and Glass Grid map to Photo + Dock + Glass. App order, wallpaper, rotation and the last Home app are preserved.

The gallery contains 15 bundled wallpapers. Settings → Background → Wallpaper keeps the two-pane Settings frame. Up/Down browses a vertical thumbnail list without wrapping; the right-hand Home preview shows the candidate while the surrounding Settings backdrop stays on the applied photo. OK applies the focused photo and stays in Wallpaper. The tick marks the applied photo and preview status distinguishes unsaved browsing. Back restores the latest applied photo, cancels pending loading and returns to Background’s Wallpaper row. Photo and material assets change as one complete bundle; a failed load restores the applied preview and offers retry. Preview loading waits briefly for remote focus to settle. OK during loading queues application for that photo; another browse move or Back cancels it. Browsing never saves, and repeated OK on the applied photo does not write again.

Settings → Background → Rotation offers Fixed, Each time Home opens, Every 5 minutes, Every 15 minutes and Every hour. Each time Home opens advances once when the launcher loads; a return to the already-running launcher does not advance it. Timed rotation counts only visible Photo Home time in either List or Dock. Panels, flat backgrounds and time spent in other apps pause the cycle. Changing the photo or rotation mode starts a new interval.

Launcher wallpaper is separate from native Art Mode. Runtime photos, materials and available fonts are local assets; they do not require the Mac or a network download.

## Sources

- [Samsung Application API](https://developer.samsung.com/smarttv/develop/api-references/tizen-web-device-api-references/application-api.html): installed-app discovery and application control.
- [Samsung application termination guide](https://developer.samsung.com/smarttv/develop/guides/fundamentals/terminating-applications.html): exiting is not treated as a deterministic Samsung Home route.

The native Home operation and startup configuration from 19 October remain separate from this app update. Home from Netflix was confirmed for that configuration; power-on after Netflix remains provisional. Streaming apps retain their own Back navigation. Netflix did not exit on repeated Back in the observed test, so there was no app-exit destination to verify. No global Back interception or key-filter hook was installed. See [TV status](tv-status.md) for device evidence; this behaviour specification is not an installation or visual-verification record for 0.6.0.

## Clock and rendering

Both layouts show the TV's local time in 12-hour format, without AM/PM or seconds. It updates at the minute boundary and on return to the launcher. No date or clock panel is shown.

Photographic materials and blurred panel backgrounds are generated before packaging and stay aligned with the full-screen image. Photo colour and contrast metadata are also prepared offline. Navigation does not sample image pixels, run an optics engine or apply live backdrop blur. Flat backgrounds use matching light or dark panel colours. Focus feedback uses transforms and opacity; reduced motion removes animated scaling and movement while retaining opacity feedback.

Hidden prelaunch can install a fully loaded wallpaper bundle without waiting for an animation frame. A valid loaded image remains usable if detached-image decoding rejects. A failed startup bundle retries when the launcher becomes visible; an active wallpaper preview keeps its candidate. Font recovery clears fallback measurements and cached markup. This readiness fallback uses a completed load and nonzero image dimensions; it does not prove a TV has painted the image, and an accepted bundle is not automatically decoded again on return. These paths have browser regression coverage; physical cold-boot behaviour still needs owner observation.


## Adaptación para TV del dormitorio

La variante local muestra TV en directo, Entradas, Todas las aplicaciones, Personalizar y Ajustes TV como accesos separados. El foco de los controles superiores usa un fondo gris discreto sobre temas de día y noche. Descargar aplicaciones abre Samsung Apps desde el panel de aplicaciones.

El catálogo se obtiene de Tizen al iniciar y al volver de otras aplicaciones. El arranque conserva una copia verificada de las apps de este televisor; las consultas fallidas conservan los datos verificados. Se retiran las apps desinstaladas sin añadir accesos del catálogo original. El orden elegido se conserva.

Entradas permite seleccionar cada HDMI. Personalizar → Samsung → Nombres HDMI permite editar las etiquetas locales con teclado en pantalla y botones Guardar/Cancelar; los alias se muestran también en el carrusel y no modifican Samsung.

TV en directo intenta mostrar el sintonizador dentro de una ventana nativa y permite pasar al visor de Samsung a pantalla completa. La lista de canales y su sintonización solo se habilitan si el firmware y los permisos realmente las permiten. Una API ausente o una denegación muestra un estado real; no se simulan canales. Salir oculta la ventana y cancela operaciones pendientes.

La asignación Home y los ajustes de inicio se gestionan por separado, con identidad y firmware exactos, instantánea original y herramienta de restauración privada. Los valores leídos del sistema no prueban el resultado de espera/encendido ni la salida visible de Netflix o YouTube.


### TDT y ajustes confirmados en la S93D

La lista real se solicita en bloques de hasta quince canales y se presenta como lista vertical desplazable a la izquierda del vídeo. Al navegar con el mando, el foco se mantiene visible y la selección mantenida 650 ms solicita la sintonización; OK la solicita inmediatamente. La llamada de TVChannel.tune usa el listener de este firmware (onsuccess, onnosignal y onprograminforeceived), conserva los identificadores de la lista y selecciona la ventana MAIN. Un evento de programa no se interpreta como confirmación de sintonización. El propietario confirmó que la emisión cambia desde la lista tras esta corrección.

Los dos accesos Ajustes TV abren com.samsung.tv.quicksetting, cuyo panel se confirmó en pantalla. Los intentos anteriores con com.samsung.tv.coba.setting, org.tizen.homesetting y la operación genérica de ajustes no mostraron el panel en este firmware.

La galería del dormitorio conserva los cuatro fondos iniciales y añade parejas de día/noche de Arcade, PC interior, Sobremesa, Portátiles, Cine y Cine en casa (veintidós fondos en total, contando Maratón de series, Guion y Rincón de streaming). Un fondo retirado guardado en preferencias se normaliza a Consolas noche. Los recursos retirados del paquete se conservan fuera de la aplicación en backups/fondos-retirados-v6.

Las entradas HDMI detectadas por la TV aparecen al final del catálogo para poder añadirlas, quitarlas y ordenarlas en Inicio junto a las apps. No se añaden automáticamente. Su identidad hdmi.N y número de puerto se conservan en preferencias; abrirlas usa el cambio de fuente real, no el lanzamiento de una aplicación. Las consultas fallidas conservan el catálogo previamente verificado de ese tipo.

### Navegación visible y editor del carrusel

Todos los paneles internos (catálogo, editor, Personalizar, sus grupos, imágenes, entradas y mensajes) comparten una cabecera con Volver al menú anterior e Inicio. La flecha arriba desde los primeros controles alcanza la cabecera; izquierda/derecha cambia entre sus acciones y abajo vuelve al control previo. En los grupos de Personalizar y en imágenes, izquierda también llega a la cabecera. El foco solo aparece en una región a la vez. Los botones pueden activarse por puntero y el botón Volver del mando sigue funcionando. La vista TV en directo conserva su botón superior Volver a Inicio; las pantallas nativas de Samsung usan sus propios controles.

Añadir y ordenar muestra Orden del carrusel y Disponibles para añadir. Cada nombre tiene una indicación Mover y las instrucciones explican OK, arriba/abajo y OK para guardar. Al mover se muestran Guardar posición y Cancelar movimiento. Terminar conserva los cambios completados y cierra el editor; Inicio cancela un movimiento aún no confirmado y vuelve a Inicio. Añadir enfoca el nombre del nuevo acceso, permitiendo ordenarlo sin que otro OK lo quite accidentalmente. La denominación acceso incluye aplicaciones y HDMI.

### Legibilidad, reloj y nombres de entradas del dormitorio

Los materiales Suave, Esmerilado y Translúcido se muestran en filas completas, con columna propia para el tick. El resto de opciones reserva espacio a la marca y permite ajustar el texto dentro de su ancho. El reloj usa HH:mm en formato de 24 horas y muestra debajo el día de la semana en español.

La API pública VIDEOSOURCE solo garantiza tipo, número y señal, no el nombre editado de Samsung. Para esta instalación se ha leído el registro nativo de fuentes como usuario SDK, con guardas de modelo y firmware y sin modificar ajustes. El nombre Steam corresponde al tipo nativo 15, HDMI 3. El importador privado guarda los nombres en .local/hdmi-probe/names.json y el constructor los incorpora a assets/source-names.js en el paquete firmado. Es una importación en la compilación: los cambios posteriores de nombre en Samsung necesitan una nueva sincronización desde el PC. Cuando una API entrega un nombre directamente se usa como nombre base; un alias manual del propietario tiene prioridad.

Los nombres nunca cambian el número de puerto de un acceso guardado. Un acceso HDMI 2 sigue abriendo HDMI 2; Steam se debe añadir como acceso del HDMI 3. El catálogo y la lista de Inicio actualizan el texto al recibir nombres distintos, sin reutilizar un texto anterior de la caché. El cambio de fuente selecciona explícitamente la ventana MAIN y después abre el visor de TV; el resultado de imagen aún requiere prueba física del propietario.

### Editor manual de nombres HDMI

Personalizar → Nombres HDMI permite elegir una entrada real (también accesible en Samsung → Nombres HDMI) y renombrar su acceso. El editor utiliza su propio teclado en pantalla, manejable con flechas y OK, con minúsculas/mayúsculas, acentos y símbolos. También admite un teclado físico. Guardar y Cancelar son botones visibles en la cabecera; Volver e Inicio descartan lo no guardado. Nombre original vacía el campo y requiere Guardar para restablecer el nombre base.

El nombre se limita a cuarenta caracteres y se guarda en cleanframe.hdmi.names.v1. Un fallo de almacenamiento mantiene el nombre anterior, conserva el borrador y muestra un error con posibilidad de reintentar o cancelar. Los alias manuales tienen prioridad sobre el nombre base y se muestran en Entradas, el catálogo, el editor y el carrusel. Nunca modifican la configuración de Samsung ni el puerto real del acceso. El guardado y la carga del catálogo conservan también el nombre base por separado para poder restablecerlo.

En Inicio, al mover el foco a los controles superiores desaparece el resaltado recordado de la app, tanto en Carrusel como en Lista. Solo el control superior mantiene foco; su placa gris tiene un contraste algo mayor en día y noche. Nombres HDMI está en el primer nivel de Personalizar; sus siete categorías caben sobre las ayudas inferiores.

### Iconos por HDMI y selección coherente

Personalizar → Entradas HDMI → una entrada muestra Cambiar nombre y Elegir icono. Se conservan el editor de nombres y su guardado independiente. Los iconos disponibles son HDMI genérico, Steam, Nintendo Switch original (sin 2) y PlayStation 5. La elección se guarda por puerto en cleanframe.hdmi.icons.v1, se muestra en el carrusel, catálogo, editor y Entradas, y no altera el número de fuente. Un error de guardado conserva el icono previo y muestra un reintento; los valores desconocidos guardados se ignoran al cargar.

Todos los controles de menús usan el mismo fondo gris de foco, borde tenue y tinta de su tema: cabeceras, Guardar/Cancelar/Nombre original, navegación, opciones y teclado. Los modos claros usan tinta oscura y superficies claras también en menús; los oscuros usan tinta clara. Los logos de 3Cat, SkyShowtime, Disney+ y atresplayer usan arte monocromo empaquetado. Las marcas se resuelven sobre apps realmente instaladas; preparar atresplayer no crea una app ausente ni un destino ficticio. Las cachés de vistas incluyen la elección del icono por puerto.

### TV en directo como acceso del carrusel

TV en directo aparece como acceso interno opcional en Añadir y ordenar. No se incorpora automáticamente a Inicio ni se presenta como una app instalada de Samsung. Se puede añadir, mover y retirar con el mismo editor, conservando orden y selección al reiniciar. Su identificador estable tv.live se conserva incluso si falla la consulta de apps; el inicio por defecto sigue eligiendo apps reales y no añade este acceso por su cuenta.

Abrirlo desde el carrusel usa exactamente la misma vista integrada de TV en directo que el control superior, con listado de canales y pantalla completa; nunca lanza tv.live como ID de aplicación del sistema. El icono original representa un televisor con antena, reproducción y punto de emisión, siguiendo la tinta monocroma del tema.

La colección Series v3 añade Maratón de series, Estudio de guion y Rincón de streaming en día y noche, sin personajes ni imágenes de series. El catálogo total contiene veintidós fondos; el selector conserva el desplazamiento y permite llegar a la última imagen con el mando.

### Explicit channel activation opens full-screen TV

Moving remote focus through the channel list retains preview tuning after the existing delay. Hover alone never opens full-screen. Pressing OK or clicking a channel tunes that channel and opens the native full-screen TV viewer only after successful tuning. The independent Ver a pantalla completa button remains available. A failed tune retains the list and its error; cancelled or superseded requests cannot trigger a late handoff.

Al recorrer la lista se conserva la sintonización de vista previa con su espera habitual. Pasar el puntero o mover el foco no abre pantalla completa. Pulsar OK o hacer clic sintoniza ese canal y abre el visor completo después de confirmar la sintonización. Se conserva Ver a pantalla completa. Los errores permanecen visibles y las peticiones canceladas o sustituidas no provocan aperturas tardías.

### Unlimited saved Home shortcuts and additional monochrome brands

Home has no application-imposed maximum shortcut count. New/default Home selection retains its existing initial size; users can add all installed apps and available HDMI/Live TV shortcuts. Saved lists and cached app records are not truncated. Dock/List navigation scrolls with focus; the order editor has an independent scrolling Home column with edge cues and a total count, supporting move/remove/undo beyond the former nine-item limit. Device storage remains a practical resource constraint; failed writes retain existing preferences.

Inicio no impone un máximo de accesos. La selección inicial conserva su tamaño; el usuario puede añadir todas las apps instaladas y accesos HDMI/TV en directo disponibles. No se recortan listas guardadas ni registros de apps. El carrusel y la lista siguen al foco; la columna de ordenación se desplaza, muestra pistas en los extremos y permite mover, quitar y deshacer más allá del antiguo límite de nueve. La capacidad de almacenamiento del televisor sigue siendo un límite práctico; un fallo de guardado conserva las preferencias anteriores.

Crunchyroll and SmartTV Club resolve to bundled monochrome SVGs using installed-app IDs or exact normalized names. Preparing their marks never creates an uninstalled app. SmartTV Club uses its official stacked-TV symbol, with TV lettering cut out for small-size legibility; light/dark theme ink follows the existing mask system.

Crunchyroll y SmartTV Club usan SVG monocromos empaquetados a partir de sus IDs o nombres normalizados. Sus iconos no añaden aplicaciones ausentes. SmartTV Club utiliza el símbolo oficial de televisores, con letras TV recortadas; la tinta clara/oscura usa el mismo sistema visual del menú.

### Live programme information 1.2

This model: narrower channel list and higher 16:9 native preview. Below the video, show the current programme title, local 24-hour schedule, progress, synopsis and next programme when supplied by the broadcaster. Reads use TVChannel getCurrentProgram/getProgramList and never tune. Existing delayed focus preview remains; OK/click still tunes and opens full screen. After a successful preview tune, refresh the metadata for that channel. A sequence guard discards replies after focus moves, the dialog closes or a newer tune begins. Refresh every 30 seconds while visible; closing cancels updates. No schedule is fabricated for empty/error results.

From a channel, Right reaches full-screen; Down from full-screen reaches the description. Up/Down scroll long descriptions; Up at its start returns to full-screen; Left returns to the selected channel; Back closes the dialog. Broadcaster language and missing descriptions are preserved. No Home/startup changes are part of this update.

### Separate programme guide 1.2

Guía de programación opens a dedicated full-screen grid: six channel rows, three hours, proportional programme widths, half-hour labels. Previous/Next changes the time window; Ahora returns to the current half hour. Channel pages and Up/Down reach the entire list. Only six channels are queried, serially, for the displayed window. No network EPG service is used; empty or missing broadcaster schedules are shown honestly. Leaving or replacing a page invalidates late replies.

Focus in the guide only reads descriptions. OK opens the visible Ver canal action; that explicit action tunes live TV and opens fullscreen, including for a future programme (it is not a scheduled recording). Back/Volver restores the live preview without changing its channel. Three lines of synopsis space are reserved in both screens; Up/Down scroll longer descriptions. Casa/startup and the other models remain unchanged.

Hardware validation of this port is recorded privately; owner acceptance on RU8005 does not establish API support on every model.
