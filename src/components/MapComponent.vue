<template>
  <div>
    <vl-map ref = "map" :load-tiles-while-animating="true" :load-tiles-while-interacting="true"
             data-projection="EPSG:4326" style="height:650px">
      <vl-view :zoom.sync="zoom" :center.sync="center" :rotation.sync="rotation"></vl-view>
      <vl-layer-tile id="osm">
        <vl-source-osm></vl-source-osm>
      </vl-layer-tile>

    <vl-interaction-select :features.sync="selectedFeatures" style="highlightStyle">
      <template slot-scope="select">
        <vl-overlay v-for="feature in select.features" :key="feature.id" :id="feature.id"
                      :position="feature.geometry.coordinates[0][0][0]" :auto-pan="true">
          <div style="background: white; border: 1px solid black">
            {{ feature.properties.region }}<br>
          </div>
        </vl-overlay>
      </template>
    </vl-interaction-select>

            <vl-layer-vector ref = "regions">
          <vl-source-vector :features ="features"></vl-source-vector>
          <vl-style-func :factory="getStyle"></vl-style-func>
      </vl-layer-vector>

      <vl-layer-vector ref = "regions_selectable">
          <vl-source-vector :features ="features"></vl-source-vector>
            <vl-style>
              <vl-style-fill color="rgba(0,0,0,0)"></vl-style-fill>
              <vl-style-stroke color="rgba(0,0,0,0)"></vl-style-stroke>
          </vl-style>
      </vl-layer-vector>


        <vl-layer-vector ref = "capitals"  :declutter="true">
          <vl-source-vector :features ="capitals">
            <vl-style-func :factory="capitalsStyle"></vl-style-func>
          </vl-source-vector>
      </vl-layer-vector>
      


    </vl-map>
  </div>
</template>

<script>
import $ from 'jquery'
import {pointerMove} from 'ol/events/condition'
var fun = require('../plugins/functions_new');
import {Fill, Stroke, Style, Text, Circle} from 'ol/style';


  export default {
    data () {
      return { 

        zoom: 3.5,
        center: [100, 65],
        rotation: 0,
        features: [],
        coordinates: [],
        loading: false,
        palette: {
            3: ["#fff7bc","#fec44f","#d95f0e"],
            4: ["#ffffd4","#fed98e","#fe9929","#cc4c02"],
            5: ["#ffffd4","#fed98e","#fe9929","#d95f0e","#993404"],
            6: ["#ffffd4","#fee391","#fec44f","#fe9929","#d95f0e","#993404"],
            7: ["#ffffd4","#fee391","#fec44f","#fe9929","#ec7014","#cc4c02","#8c2d04"],
            8: ["#ffffe5","#fff7bc","#fee391","#fec44f","#fe9929","#ec7014","#cc4c02","#8c2d04"],
            9: ["#ffffe5","#fff7bc","#fee391","#fec44f","#fe9929","#ec7014","#cc4c02","#993404","#662506"]
      },
      currentPosition: [30,30],
      currentName: undefined,
      mapCursor: 'default',
      capitals: [],
      selectedFeatures: [],
      }
    },

    props: ['array', 'stats', 'breaks', 'revision'],


    mounted () {
      var self = this
      var nodehost = 'http://localhost/startupsnode'
      $.ajax({
            url: nodehost,
            type: 'POST',
            data: JSON.stringify({
              table:'geo'
            }),
            success: function(d) {
              self.features = d.features
            }
        })
        $.ajax({
                  url: nodehost,
                  type: 'POST',
                  data: JSON.stringify({
                    table:'geo',
                    capitals:'yes'
                  }),
                  success: function(d) {
                    console.log(d.features)
                    self.capitals = d.features
                  }
                  })
    },

    watch: {
      revision: function() {
        return this.getStyle
      }
    },

    methods: {
      pointerMoveCondition: pointerMove,

    loadFeatures() {
    var self = this
    var nodehost = 'http://localhost/startupsnode'
      $.ajax({
            url: nodehost,
            type: 'POST',
            data: JSON.stringify({
              table:'geo'
            }),
            success: function(d) {
              self.features = d.features
            }
        })

    },

    loadCapitals() {
    var self = this
    var nodehost = 'http://localhost/startupsnode'
    $.ajax({
                  url: nodehost,
                  type: 'POST',
                  data: JSON.stringify({
                    table:'geo',
                    capitals:'yes'
                  }),
                  success: function(d) {
                    self.capitals = d.features
                  }
                  })

    },

    
    getStyle() {
      console.log(this.array)
      console.log('style')

   return feature => { 

    var code = feature.get('code_region'); 
    if (this.array != null) {
      var rows = this.array.filter(function(r) {
        return r.code_region === code
      })
      var value
      if (rows[0]) {
        value = rows[0].value
      } else {
        value = null
      }
      return new Style({
        fill: new Fill({
            color:  fun.select_unicolor(value, this.stats[0].min, this.stats[0].max, this.breaks, this.palette)
        }),
        stroke: new Stroke({
          color: 'rgba(0, 0, 0, 1)',
          width: 1
        })
      })
    }
    else {
      return new Style({
        fill: new Fill({
            color: 'rgba(255, 255, 255, 0.5)'
        }),
        stroke: new Stroke({
          color: 'rgba(0, 0, 0, 1)',
          width: 1
        })
      })
    }
   }
  },

  capitalsStyle() {
    return feature => {
      var label = feature.get('name_rus')

     let style = new Style({
         image: new Circle({
    fill: new Fill({
      color: 'rgba(255,255,255,1)'
    }),
    stroke: new Stroke({
      color: '#000000',
      width: 1.25
    }),
    radius: 3
  }),
  fill: new Fill({
    color: 'rgba(255,255,255,1)'
  }),
  stroke: new Stroke({
    color: '#000000',
    width: 1.25
  }),
       text: new Text({
         text: label,
    offsetY: -10,
    offsetX: 10,
    font: '12px Calibri,sans-serif',
    fill: new Fill({
      color: '#000',
    }),
    stroke: new Stroke({
      color: '#fff',
      width: 3,
    }),
  }),
  })
     return style
    }
  },

}
}
</script>