<template>
  <v-app>
    <v-app-bar
      color="orange lighten-2"
      density="compact"
    >
    <v-app-bar-nav-icon @click="options = !options" variant="plain"></v-app-bar-nav-icon>
      <v-toolbar-title>Инновационный потенциал регионов России</v-toolbar-title>
    <v-spacer></v-spacer>      
    <v-tooltip bottom>
      <template v-slot:activator="{ attrs, on }">
      <v-btn           
      v-bind="attrs"
      v-on ="on"
      v-on:click="getExport()">
        <v-icon
        color="blue-darken2"
      >
        mdi-microsoft-excel
        </v-icon>
      </v-btn>
      </template>
      <span>Экспорт данных в Excel</span>
    </v-tooltip>     
    </v-app-bar>
    <MapComponent :array = "array" :stats = "stats" :breaks = "breaks" :revision="revision" /> 
    <v-navigation-drawer 
    app 
    v-model="options" 
    temporary
    width="400"
    dense
    >
      <v-list-item>
        <v-list-item-content>
          <v-list-item-title class="text-h6">
            Параметры
          </v-list-item-title>
          <v-list-item-subtitle>
            Управление отображением
          </v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>

      <v-divider></v-divider>

      <v-list density="compact" nav>
        <v-list-item>
            <v-list-item-title class="text-h7">
              Параметр
            </v-list-item-title>
        </v-list-item>
        <v-list-item>
           <v-select
            v-model="param"
            :items="paramOptions"
            item-text="param"
            item-value="code_param"
            @change = "getData(); getYears(); getStats(); updateStyle();"
            dense
            filled
            single-line
          ></v-select>
        </v-list-item>
      </v-list>     


      <v-divider></v-divider>

      <v-list density="compact">

        <v-list-item>
          <v-list-item-content>
            <v-list-item-title class="text-h7">
              Год
            </v-list-item-title>
          </v-list-item-content>
        </v-list-item>

        <v-list-item>
          <v-select
            v-model="year"
            :items="yearOptions"
            @change = "getData(); getParams(); getStats(); updateStyle();"
            dense
            filled
          >
          </v-select>
        </v-list-item>        
      </v-list>
      
      <v-divider></v-divider>

      <v-list density="compact">
        <v-list-item>
          <v-list-item-content>
            <v-list-item-title class="text-h7">
              Метод классификации
            </v-list-item-title>
          </v-list-item-content>
        </v-list-item>

        <v-list-item>
          <v-select
            v-model="method"
            :items="methods"
            @change = "getData(); updateStyle();"
            label="Выберите метод"
            dense
            filled
          >
          </v-select>
        </v-list-item>
      <v-divider></v-divider>

      <v-list-item>
        <span v-html = "content">{{content}}</span>
        </v-list-item>
      </v-list>
      <v-divider></v-divider>
    
    </v-navigation-drawer>
     <div class="text-center">
    <!-- <v-btn
      color="orange"
      dark
      @click="sheet = !sheet"
    >
      Графики
    </v-btn> -->
     </div>

    <v-main style="padding-bottom:0;">   
      <v-container fluid>
          <PlotComponent :values="all_values" :regions="regions" :param="name_param" :year="year" />
      </v-container>
    </v-main>

    <!-- <v-footer app>
    </v-footer> -->
  </v-app>
</template>
	<style>
		html, body { 
        margin: 0;  
        height: 100%;  
      }
      map { 
        min-height: 0; 
        flex: 1; 
        height: 70%;
      }
      .geostats-legend div {
  margin:3px 10px 5px 10px;
  clear:left;
}

.geostats-legend-title {
  font-weight: bold;
  margin-bottom: 4px;
}

.geostats-legend-block {
  border: 1px solid #555555;
  display: block;
  float: left;
  height: 12px;
  margin: 0 5px 0 20px;
  width: 20px;
}

.geostats-legend-counter { 
  font-size: 0.8em;
  color:#666;
  font-style: italic;
}
</style>

<script>
import MapComponent from './components/MapComponent.vue'
import PlotComponent from './components/PlotComponent.vue'
import $ from 'jquery'
import geostats from 'geostats';

var nodehost = 'http://localhost/startupsnode'
var next_round = false

function Jenks_Rounding(breaks) {
  var breaks_0 = breaks[0];
  var breaks_end = breaks[breaks.length - 1];
  console.log(breaks_0);
  console.log(breaks_end);
  breaks = breaks.slice(1, breaks.length - 1);
  console.log('breaks to round:', breaks);
  var roundings_less_1 = [0.001, 0.002, 0.005, 0.01, 0.02, 0.05, 0.1, 0.2, 0.5, 1];
  var roundings_small = [0.1, 0.2, 0.5, 1, 2, 5, 10, 20, 50, 100, 200, 500];
  var roundings_big = [500, 1000, 2000, 5000, 10000, 20000, 50000, 100000, 200000, 500000, 1000000];
  const getNumber = (arr, searchNum) => 
  arr.find(it => Math.abs(it - searchNum) === Math.min(...arr.map(it => Math.abs(it - searchNum))));

  function roundMultiple(num, multiple) {
    return(Math.round(num / multiple) * multiple);
  }
  var new_breaks = breaks.map((item) => {
    var roundings
    var round
    if (item > 1000) {
      roundings = roundings_big;
      round = getNumber(roundings, item/10);
      next_round = 0;
    } else if (item < 2) {
      roundings = roundings_less_1;
      round = getNumber(roundings, item/100);
    } else {
      roundings = roundings_small;
      round = getNumber(roundings, item/100);
    }
    if (item > 40 && (item % 50 < 5 || item %50 > 45)) { 
      round = 50;
    }
    if (item > 400 && (item % 500 < 50 || item % 500 > 450)) {
      round = 500;
    }
    if (item % 1 == 0) {
      round = 1;
    }
    if (round == 0.001 || round == 0.002 || round == 0.005){
      next_round = 3;
    } else if (round == 0.01 || round == 0.02 || round == 0.05){
      next_round = 2;
    } else if (round == 0.1 || round == 0.2 || round == 0.5){
      next_round = 1;
    } else {
      next_round = 0;
    }
    return roundMultiple(item, getNumber(roundings, round));
})
  new_breaks.splice(0, 0, breaks_0);
  new_breaks.push(breaks_end);
  console.log(new_breaks);
  return new_breaks;
}

export default {
  name: 'App',

  components: {
    MapComponent,
    PlotComponent,
  },

  data: () => ({
      zoom: 4.5,
      center: [100, 65],
      rotation: 0,
      options: true,
      story: {
        show: true,
        width: 400,
        border: 3
      },
      helpitems: [
        { title: 'О приложении' },
        { title: 'Справка' },
        { title: 'Спонсоры' },
      ],
      method: 'Квантили',
      methods: [
        'Квантили',
        'Равные интервалы',
        'Естественные интервалы'
      ],
      yearOptions: [],
      year: 2010,
      param: {code_param: 1, param: "Число новых высокотехнологичных фирм"},
      paramOptions: [],
      values: [],
      all_values: [],
      regions: [],
      array: [],
      stats: [],
      breaks: [],
      revision: false,
      palette: {
            3: ["#fff7bc","#fec44f","#d95f0e"],
            4: ["#ffffd4","#fed98e","#fe9929","#cc4c02"],
            5: ["#ffffd4","#fed98e","#fe9929","#d95f0e","#993404"],
            6: ["#ffffd4","#fee391","#fec44f","#fe9929","#d95f0e","#993404"],
            7: ["#ffffd4","#fee391","#fec44f","#fe9929","#ec7014","#cc4c02","#8c2d04"],
            8: ["#ffffe5","#fff7bc","#fee391","#fec44f","#fe9929","#ec7014","#cc4c02","#8c2d04"],
            9: ["#ffffe5","#fff7bc","#fee391","#fec44f","#fe9929","#ec7014","#cc4c02","#993404","#662506"]
      },
      content: null,
      serie: null,
      href: null,
      sheet: null,
      name_param: "Число новых высокотехнологичных фирм",
  }),

   computed: {
        selectedtext: function()
        {return this.paramOptions[this.param]}
    },

  methods: {

    getYears: function() {
      var self = this
      console.log('Years are changing')
      console.log(self.param)
      self.yearOptions = []
      $.ajax({
      url: nodehost,
      type: 'POST',
      data: JSON.stringify({
        get_years: 'yes',
        code_param: self.param
      }),
      success: function(data) {
        for (let i = 0; i < data.rows.length; i++) {
          self.yearOptions.push(data.rows[i].year)
          for (let i = 0; i < self.paramOptions.length; i++) {
              if (self.paramOptions[i].code_param == self.param) {
                  self.name_param = self.paramOptions[i].param
              }
          }
        }
      }
    });
    },

    getParams: function() {
      var self = this
      console.log('Params are changing')
      console.log(self.year)
      self.paramOptions = []
      $.ajax({
      url: nodehost,
      type: 'POST',
      data: JSON.stringify({
        parameters: 'yes',
        year: self.year
      }),
      success: function(data) {
        for (let i = 0; i < data.rows.length; i++) {
          self.paramOptions.push(data.rows[i])
        }
      }
    });
    },

    getData: function() {
      var self = this
      console.log('data is loading')
      console.log('method', self.method)
      $.ajax({
      url: nodehost,
      type: 'POST',
      data: JSON.stringify({
        year: self.year,
        code_param: self.param,
        stats: 'no'
      }),
      success: function(data) {
        console.log('data loaded')
        console.log('param:',self.param)
        self.array = data.rows;
        self.values = [];
        self.regions = [];
        self.all_values = [];
        
        for (let i = 0; i < self.array.length; i++) {
          var value = self.array[i].value; 
          var region = self.array[i].region;         
          self.all_values.push(value);
          self.regions.push(region);
          }
//1) combine the arrays:
      var list = [];
      for (var j = 0; j < self.regions.length; j++) 
          list.push({'region': self.regions[j], 'value': self.all_values[j]});

      //2) sort:
      list.sort(function(a, b) {
          return ((a.value < b.value) ? -1 : ((a.value == b.value) ? 0 : 1));
      });
      //3) separate them back out:
      for (var k = 0; k < list.length; k++) {
          self.regions[k] = list[k].region;
          self.all_values[k] = list[k].value;
      }
        function removeNullUndefinedEmptyFromArray(arrayToClean) {
          const cleanedArray = [];
          arrayToClean.forEach((val) => {
            if(val !== null && typeof val !== "undefined" && (""+val).trim() !== ""){
              cleanedArray.push(val);
            }
          });
          return cleanedArray;
        }
        self.values = removeNullUndefinedEmptyFromArray(self.all_values);
        console.log('values:', self.values);

      this.serie = new geostats(self.values);
      if (self.method == 'Квантили') {
        self.breaks = this.serie.getClassQuantile(7);
      } else if (self.method == 'Равные интервалы') {
        self.breaks = this.serie.getClassEqInterval(7);
      } else if (self.method == 'Естественные интервалы') {
        self.breaks = this.serie.getClassJenks(7);
      }
      self.breaks = this.serie.setClassManually(Jenks_Rounding(self.breaks));
      if (next_round == 3){
        this.serie.setPrecision(3);
      } else if (next_round == 0) {
        this.serie.setPrecision(0);
      } else if (next_round == 1) {
        this.serie.setPrecision(1);
      } else if (next_round == 2) {
      this.serie.setPrecision(2);
    }
      var color_x  = self.palette[7];
      this.serie.setColors(color_x);
      self.content = this.serie.getHtmlLegend(null, "Условные обозначения", true, null, null, 'DESC');  
      console.log(self.content)

      console.log('breaks:', self.breaks)
        }
      })
    },

  getStats: function() {
    var self = this
  $.ajax({
    url: nodehost,
    type: 'POST',
    data: JSON.stringify({
      year: self.year,
      code_param: self.param,
      stats: 'yes'
    }),
    success: function(data) { 
      self.stats = data.rows;
      console.log('max:', self.stats[0].max)
    }
  });   
},

  updateStyle: function() {
    this.revision = !this.revision
  },

  getExport: function() {
  console.log('export started')
  var self = this
  $.ajax({
    url: nodehost,
    type: 'POST',
    data: JSON.stringify({
      get_export: 'yes',
      code_param: self.param
    }),
    success: function(data) {
      var name_param = data.rows[1].param.split(' ').join('_');
      const a = document.createElement('a')
      var url = '/files/экспорт_' + name_param +'.xlsx';
      console.log(url)
      a.href = url
      a.download = url.split('/').pop()
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      }
  });    
  }

},

  mounted() {
    var self = this
    $.ajax({
      url: nodehost,
      type: 'POST',
      data: JSON.stringify({
        parameters: 'yes',
        year: self.year
      }),
      success: function(data) {
        for (let i = 0; i < data.rows.length; i++) {
          self.paramOptions.push(data.rows[i])
        }
      }
    })

    $.ajax({
      url: nodehost,
      type: 'POST',
      data: JSON.stringify({
        get_years: 'yes',
        code_param: self.param.code_param
      }),
      success: function(data) {
        for (let i = 0; i < data.rows.length; i++) {
          self.yearOptions.push(data.rows[i].year)
        }
      }
    })
    $.ajax({
      url: nodehost,
      type: 'POST',
      data: JSON.stringify({
        year: self.year,
        code_param: self.param.code_param,
        stats: 'no'
      }),
      success: function(data) {
        self.array = data.rows;
        console.log('array:', self.array)
        self.values = [];
        self.regions = [];
        self.all_values = [];
        
        for (let i = 0; i < self.array.length; i++) {
          var value = self.array[i].value; 
          var region = self.array[i].region;         
          self.all_values.push(value);
          self.regions.push(region);
          }
//1) combine the arrays:
      var list = [];
      for (var j = 0; j < self.regions.length; j++) 
          list.push({'region': self.regions[j], 'value': self.all_values[j]});

      //2) sort:
      list.sort(function(a, b) {
          return ((a.value < b.value) ? -1 : ((a.value == b.value) ? 0 : 1));
          //Sort could be modified to, for example, sort on the age 
          // if the name is the same.
      });
      //3) separate them back out:
      for (var k = 0; k < list.length; k++) {
          self.regions[k] = list[k].region;
          self.all_values[k] = list[k].value;
      }
        function removeNullUndefinedEmptyFromArray(arrayToClean) {
          const cleanedArray = [];
          arrayToClean.forEach((val) => {
            if(val !== null && typeof val !== "undefined" && (""+val).trim() !== ""){
              cleanedArray.push(val);
            }
          });
          return cleanedArray;
        }

        self.name_param = self.param.param
        console.log(this.name_param)
        self.values = removeNullUndefinedEmptyFromArray(self.all_values);
        console.log('values:', self.values);
      this.serie = new geostats(self.values);
      // next_round = false
      if (self.method == 'Квантили') {
        self.breaks = this.serie.getClassQuantile(7);
      } else if (self.method == 'Равные интервалы') {
        self.breaks = this.serie.getClassEqInterval(7);
      } else if (self.method == 'Естественные интервалы') {
        self.breaks = this.serie.getClassJenks(7);
      }
      var color_x  = ["#ffffd4","#fee391","#fec44f","#fe9929","#ec7014","#cc4c02","#8c2d04"];
      this.serie.setColors(color_x);
      self.content = this.serie.getHtmlLegend(null, "Условные обозначения", true, null, null, 'DESC');  
      console.log(self.content)
      console.log('breaks:', self.breaks)
          }
      });
       $.ajax({
          url: nodehost,
          type: 'POST',
          data: JSON.stringify({
            year: self.year,
            code_param: self.param.code_param,
            stats: 'yes'
          }),
          success: function(data) { 
            self.stats = data.rows;
            console.log('max:', self.stats[0].max);
            console.log('min:', self.stats[0].min)
          }
        });

  }
}

</script>

<style>
  html, body {
    margin: 0;   
    height: 100%;
  }
  #app{
    display: flex;
    flex-direction: column;
    height: 100%;
  }
</style>

<!--
ховер и вынос показателя ??
начать смотреть графики (plotly) - интерактив, выбранный регион подсвечивается на карте и наоборот
добавить коды регионам в экспорте
добавить единицы измерения в легенду (реально или нет?) 
вынести название параметра куда-нибудь на карту
разобраться с панелью графика
-->