<template>
  <div >
    <v-container grid-list-xl fluid>
      <v-layout row wrap>
        <v-flex lg12 sm12 xs12>
          
          <a-table :columns="columns" :dataSource="sortUserAlphabeticaly" @change="onChange" rowKey="_id" :loading="loading">
            <a slot="name" slot-scope="text" href="javascript:;">{{text }}</a>          
            <template slot="daterange" slot-scope="text, record, index">
              <a-range-picker @change="onChange" >
                <template slot="dateRender" slot-scope="current">
                  <div class="ant-calendar-date" :style="getCurrentStyle(current)">
                    {{current.date()}}
                  </div>
                </template>
              </a-range-picker>
            </template>
            
            <template slot="operation" slot-scope="text, record, index">
              <div class='editable-row-operations'>
                <a-button type="primary"><a @click="generateInvoice(record.driver, record._id)">Generate Invoice</a></a-button>
                
              </div>    
            </template> 
          </a-table>

          <a-modal
            title="Invoice"
            v-model="showModal"
            width="800px"
            style="top: 20px;"
           
          >
            <template slot="footer">
              <a-button key="back" @click="handleCancel">Return</a-button>
              
              <a-button  type="primary"  v-if="printReady"
        
                onclick="printJS('printMe', 'html')">
                Print
              </a-button>
            </template>
            <div class="invoice-box" v-if="driverInfo.name" id="printMe">
              <h2 class="text-xs-center p-5">Invoice</h2>
              <table cellpadding="0" cellspacing="0">
                  <tr class="top">
                      <td colspan="2">
                          <table>
                              <tr>
                                  <td class="title" style="width:100%; max-width:300px;">
                                      <!-- <img src="../../static/fsi-logo.png" style="width:100%; max-width:300px;"> -->
                                  </td>
                                  
                                  
                              </tr>
                          </table>
                      </td>
                  </tr>
                  
                  <tr class="information">
                      <td colspan="2">
                          <table>
                              <tr>
                                  <td class="pt-5">
                                    
                                      {{driverInfo.name}}<br>
                                      {{driverInfo.address.streetAddress}}<br>
                                      {{driverInfo.address.town}}, {{driverInfo.address.country}} {{driverInfo.address.postalCode}}
                                  </td>
                                  
                                  <td>
                                    <img src="../../static/fsi-logo.png" style="width:150px; max-width:300px;"><br>
                                      FSI.<br>
                                      Surrey, United Kingdom<br>
                                      07865500851<br>
                                      fsiuk3@gmail.com
                                  </td>
                                  
                              </tr>
                              
                          </table>
                      </td>
                  </tr>
                  
                  <tr class="heading mt-5 pt-4">
                      <td>
                          Regular Shifts
                      </td>
                      
                      <td>
                           Price
                      </td>
                  </tr>
                  
                  <tr class="details">
                      <td>
                          Shift ({{invoiceInfo.totalShiftsPerMonth}} x £{{driverInfo.ratePerTrip}})
                      </td>
                      
                      <td>
                          £{{invoiceInfo.totalShiftsPerMonth *  driverInfo.ratePerTrip}}.00
                      </td>
                  </tr>
                  
                  <tr class="heading">
                      <td>
                          Alternative Shifts
                      </td>
                      
                      <td>
                          Price
                      </td>
                  </tr>
                  
                  <tr class="item">
                      <td>
                          Shift ({{invoiceInfo.totalAlternativeShiftsPerMonth}}  x £{{driverInfo.ratePerTrip}})
                      </td>
                      
                      <td>
                          £{{invoiceInfo.totalAlternativeShiftsPerMonth *  driverInfo.ratePerTrip}}.00
                      </td>
                  </tr>
                  
                  
                  
                  <tr class="total">
                      <td></td>
                      
                      <td>
                        Total: £{{ (invoiceInfo.totalShiftsPerMonth *  driverInfo.ratePerTrip) + (invoiceInfo.totalAlternativeShiftsPerMonth *  driverInfo.ratePerTrip)}}.00
                      </td>
                  </tr>
              </table>
          </div>
            
          </a-modal>

          
        </v-flex>       
      </v-layout>
    </v-container>
  </div>
</template>
<script>
import axios from "axios";
import print from "print-js";

const columns = [
  {
    title: "Name",
    dataIndex: "driver.name",
    width: "10%",
    scopedSlots: { customRender: "name" },
    // specify the condition of filtering result
    // here is that finding the name started with `value`
    onFilter: (value, record) => record.name.indexOf(value) === 0,
    sorter: (a, b) => a.driver.name.length - b.driver.name.length
  },
  // {
  //   title: "Email",
  //   dataIndex: "driver.email",
  //   width: "10%",
  //   scopedSlots: { customRender: "email" },
  //   onFilter: (value, record) => record.name.indexOf(value) === 0,
  //   sorter: (a, b) => a.driver.email.length - b.driver.email.length
  // },

  {
    title: "Select Month",
    dataIndex: "daterange",
    scopedSlots: { customRender: "daterange" },
    width: "15%"
  },
  {
    title: "Action",
    dataIndex: "operation",
    width: "20%",
    scopedSlots: { customRender: "operation" }
  }
];

const data = [];
// for (let i = 1; i < 100; i++) {
//   data.push({
//     key: i.toString(),
//     name: `Edrward ${i}`,
//     age: 32,
//     address: `London Park no. ${i}`
//   });
// }

function onChange(pagination, filters, sorter) {
  console.log("params", pagination, filters, sorter);
}

export default {
  data() {
    this.cacheData = data.map(item => ({ ...item }));
    return {
      data,
      columns,
      loading: false,
      showModal: false,
      confirmLoading: false,
      driverInfo: {},
      startDate: "",
      endDate: "",
      invoiceInfo: {},
      printReady: false
    };
  },
  beforeCreate() {
    this.form = this.$form.createForm(this);
  },
  computed: {
    sortUserAlphabeticaly(){
      return _.sortBy(this.data, [function(o) { return o.driver.name; }]);
    }
  },
  methods: {
    onChange,

    getCurrentStyle(current, today) {
      const style = {};
      if (current.date() === 1) {
        style.border = "1px solid #1890ff";
        style.borderRadius = "50%";
      }
      return style;
    },
    handleCancel(e) {
      this.showModal = false;
    },
    onChange(date, dateString) {
      this.startDate = dateString[0];
      this.endDate = dateString[1];
    },
    // print() {
    //   // Pass the element id here
    //   printJs("printMe", "html");
    // },
    generateInvoice(driver, userId) {
      this.driverInfo = driver;
      axios
        .post("/api/generate-invoice", {
          userId,
          startDate: this.startDate,
          endDate: this.endDate
        })
        .then(res => {
          if (res.data.success) {
            this.showModal = true;
            this.invoiceInfo = res.data;
          } else {
            this.$message.warning(res.data.message);
          }
        });
    },
    getDrivers() {
      this.loading = true;
      axios.get("/api/get-drivers").then(res => {
        if (res.data.success) {
          this.data = res.data.drivers;
          this.loading = false;
        }
      });
    }
  },
  created() {
    this.getDrivers();
  },

  mounted() {
    import("print-js").then(() => {
      this.printReady = true;
    });
  }
};
</script>
<style scoped>
.editable-row-operations a {
  margin-right: 8px;
}

/* tile uploaded pictures */
.upload-list-inline .ant-upload-list-item {
  float: left;
  width: 200px;
  margin-right: 8px;
}
.upload-list-inline .ant-upload-animate-enter {
  animation-name: uploadAnimateInlineIn;
}
.upload-list-inline .ant-upload-animate-leave {
  animation-name: uploadAnimateInlineOut;
}

.invoice-box {
  max-width: 800px;
  margin: auto;
  padding: 30px;
  border: 1px solid #eee;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.15);
  font-size: 16px;
  line-height: 24px;
  font-family: "Helvetica Neue", "Helvetica", Helvetica, Arial, sans-serif;
  color: #555;
}

.invoice-box table {
  width: 100%;
  line-height: inherit;
  text-align: left;
}

.invoice-box table td {
  padding: 5px;
  vertical-align: top;
}

.invoice-box table tr td:nth-child(2) {
  text-align: right;
}

.invoice-box table tr.top table td {
  padding-bottom: 20px;
}

.invoice-box table tr.top table td.title {
  font-size: 45px;
  line-height: 45px;
  color: #333;
}

.invoice-box table tr.information table td {
  padding-bottom: 40px;
}

.invoice-box table tr.heading td {
  background: #eee;
  border-bottom: 1px solid #ddd;
  font-weight: bold;
}

.invoice-box table tr.details td {
  padding-bottom: 20px;
}

.invoice-box table tr.item td {
  border-bottom: 1px solid #eee;
}

.invoice-box table tr.item.last td {
  border-bottom: none;
}

.invoice-box table tr.total td:nth-child(2) {
  border-top: 2px solid #eee;
  font-weight: bold;
}

@media only screen and (max-width: 600px) {
  .invoice-box table tr.top table td {
    width: 100%;
    display: block;
    text-align: center;
  }

  .invoice-box table tr.information table td {
    width: 100%;
    display: block;
    text-align: center;
  }
}

/** RTL **/
.rtl {
  direction: rtl;
  font-family: Tahoma, "Helvetica Neue", "Helvetica", Helvetica, Arial,
    sans-serif;
}

.rtl table {
  text-align: right;
}

.rtl table tr td:nth-child(2) {
  text-align: left;
}
</style>