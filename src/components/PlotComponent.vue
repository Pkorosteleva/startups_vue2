<template>
    <v-row justify="center">
        <v-expansion-panels>
            <v-expansion-panel>
                    <v-card>
                        <v-card-title>
                        </v-card-title>

                        <v-card-subtitle>
                        </v-card-subtitle>

                        <v-card-text> 
                          <Plotly :data="data" :layout="layout" :display-mode-bar="false"></Plotly>
                        </v-card-text>
                        <v-expand-transition>
                        <div v-show="show">
                            <v-divider></v-divider>
                        </div>
                        </v-expand-transition>
                    </v-card>
             
            </v-expansion-panel>
        </v-expansion-panels>
    </v-row>
    
</template>

<script>
import { Plotly } from 'vue-plotly'

export default {
  components: {
    Plotly
  },
  props: ['values', 'regions', 'param', 'year'],

  computed: {
    data: function () {
     var data = [{
       x: this.regions,
        y: this.values,
        // text: this.regions,
        type:"bar",
      }]
      console.log(data)
       return data;
    },
    layout: function() {
     var layout = {
        title: this.param + ', ' + this.year + ' г.'
      }
      return layout
    }
  },
  data() {
    return {
      show: false,
    }
  }
}
</script>